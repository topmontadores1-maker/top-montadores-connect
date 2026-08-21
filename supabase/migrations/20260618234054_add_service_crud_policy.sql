DROP POLICY IF EXISTS "Only admin can modify services" ON public.services;

CREATE POLICY "Only admin can modify services"
ON public.services
FOR ALL
TO authenticated
USING (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63')
WITH CHECK (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63');
