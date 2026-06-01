import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { computeAnalytics } from '@/lib/utils';
import { Application } from '@/types/database';


export async function POST() {
  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: openAiApiKey });
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // Fetch applications + profile
  const [{ data: applications, error: applicationsError }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from('applications').select('*').eq('user_id', user.id),
    supabase.from('users_profile').select('*').eq('user_id', user.id).single(),
  ]);

  if (applicationsError) {
    return NextResponse.json({ error: applicationsError.message }, { status: 500 });
  }

  if (profileError && profileError.code !== 'PGRST116') {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const apps = (applications as Application[]) ?? [];

  if (apps.length < 3) {
    return NextResponse.json(
      { error: 'Add at least 3 applications before generating insights.' },
      { status: 400 }
    );
  }

  const stats = computeAnalytics(apps);

  // Build a structured data summary for the prompt
  const dataContext = {
    totalApplications: stats.total,
    active: stats.active,
    offers: stats.offers,
    rejections: stats.rejections,
    responseRate: `${stats.responseRate}%`,
    interviewConversionRate: `${stats.interviewConversionRate}%`,
    offerRate: `${stats.offerConversionRate}%`,
    funnel: stats.funnel,
    topSectors: stats.bySector.slice(0, 5),
    recentApplications: apps
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((a) => ({
        company: a.company_name,
        role: a.role_title,
        sector: a.sector,
        status: a.status,
        appliedDate: a.application_date,
      })),
    profile: {
      university: profile?.university,
      degree: profile?.degree,
      targetRoles: profile?.target_roles,
      targetSectors: profile?.target_sectors,
    },
  };

  const systemPrompt = `You are a placement strategy advisor for UK university students applying to internships and placement years. 
You analyse application data and give concise, specific, actionable insights.
Always respond ONLY with valid JSON — no markdown, no explanation outside the JSON.
Be specific and reference actual numbers from the data. Be encouraging but honest about weaknesses.`;

  const userPrompt = `Here is the student's application data:
${JSON.stringify(dataContext, null, 2)}

Respond with JSON in exactly this format:
{
  "summary": "2-3 sentence overview of their placement search so far, referencing key numbers",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weaknesses": ["specific weakness/concern 1", "specific weakness/concern 2"],
  "next_steps": ["specific action 1 for this week", "specific action 2", "specific action 3"]
}

Keep each point to 1-2 sentences. Be specific, not generic.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    let parsed: {
      summary: string;
      strengths: string[];
      weaknesses: string[];
      next_steps: string[];
    };

    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response.' }, { status: 500 });
    }

    // Save to database
    const { data: insight, error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: user.id,
        summary: parsed.summary,
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
        next_steps: parsed.next_steps,
        raw_data: dataContext,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ insight });
  } catch (err: unknown) {
    console.error('OpenAI error:', err);
    return NextResponse.json({ error: 'Failed to generate insights.' }, { status: 500 });
  }
}
