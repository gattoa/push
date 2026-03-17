-- =============================================================
-- Push — Row Level Security Policies
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- =============================================================

-- 1. ENABLE RLS ON ALL TABLES
-- =============================================================

ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;


-- 2. weekly_plans — direct user_id match
-- =============================================================

CREATE POLICY "Users can view own plans"
  ON public.weekly_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans"
  ON public.weekly_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON public.weekly_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON public.weekly_plans FOR DELETE
  USING (auth.uid() = user_id);


-- 3. planned_days — ownership via weekly_plans.plan_id
-- =============================================================

CREATE POLICY "Users can view own days"
  ON public.planned_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weekly_plans
      WHERE weekly_plans.id = planned_days.plan_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own days"
  ON public.planned_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.weekly_plans
      WHERE weekly_plans.id = planned_days.plan_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own days"
  ON public.planned_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.weekly_plans
      WHERE weekly_plans.id = planned_days.plan_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own days"
  ON public.planned_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.weekly_plans
      WHERE weekly_plans.id = planned_days.plan_id
        AND weekly_plans.user_id = auth.uid()
    )
  );


-- 4. planned_exercises — ownership via planned_days → weekly_plans
-- =============================================================

CREATE POLICY "Users can view own exercises"
  ON public.planned_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.planned_days
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_days.id = planned_exercises.planned_day_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own exercises"
  ON public.planned_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.planned_days
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_days.id = planned_exercises.planned_day_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercises"
  ON public.planned_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.planned_days
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_days.id = planned_exercises.planned_day_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercises"
  ON public.planned_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.planned_days
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_days.id = planned_exercises.planned_day_id
        AND weekly_plans.user_id = auth.uid()
    )
  );


-- 5. planned_sets — ownership via planned_exercises → planned_days → weekly_plans
-- =============================================================

CREATE POLICY "Users can view own sets"
  ON public.planned_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.planned_exercises
      JOIN public.planned_days ON planned_days.id = planned_exercises.planned_day_id
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_exercises.id = planned_sets.planned_exercise_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own sets"
  ON public.planned_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.planned_exercises
      JOIN public.planned_days ON planned_days.id = planned_exercises.planned_day_id
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_exercises.id = planned_sets.planned_exercise_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own sets"
  ON public.planned_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.planned_exercises
      JOIN public.planned_days ON planned_days.id = planned_exercises.planned_day_id
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_exercises.id = planned_sets.planned_exercise_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own sets"
  ON public.planned_sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.planned_exercises
      JOIN public.planned_days ON planned_days.id = planned_exercises.planned_day_id
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_exercises.id = planned_sets.planned_exercise_id
        AND weekly_plans.user_id = auth.uid()
    )
  );


-- 6. set_logs — ownership via planned_exercises → planned_days → weekly_plans
-- =============================================================

CREATE POLICY "Users can view own set logs"
  ON public.set_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.planned_exercises
      JOIN public.planned_days ON planned_days.id = planned_exercises.planned_day_id
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_exercises.id = set_logs.planned_exercise_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own set logs"
  ON public.set_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.planned_exercises
      JOIN public.planned_days ON planned_days.id = planned_exercises.planned_day_id
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_exercises.id = set_logs.planned_exercise_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own set logs"
  ON public.set_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.planned_exercises
      JOIN public.planned_days ON planned_days.id = planned_exercises.planned_day_id
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_exercises.id = set_logs.planned_exercise_id
        AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own set logs"
  ON public.set_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.planned_exercises
      JOIN public.planned_days ON planned_days.id = planned_exercises.planned_day_id
      JOIN public.weekly_plans ON weekly_plans.id = planned_days.plan_id
      WHERE planned_exercises.id = set_logs.planned_exercise_id
        AND weekly_plans.user_id = auth.uid()
    )
  );
