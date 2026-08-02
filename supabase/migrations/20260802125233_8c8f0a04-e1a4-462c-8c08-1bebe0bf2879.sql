CREATE TABLE public.site_pages (
  id text PRIMARY KEY,
  heading text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  meta_title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_pages TO anon;
GRANT SELECT ON public.site_pages TO authenticated;
GRANT ALL ON public.site_pages TO service_role;

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published page copy"
ON public.site_pages FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins can read all page copy"
ON public.site_pages FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
));

CREATE POLICY "Service role manages page copy"
ON public.site_pages FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_site_pages_updated_at
BEFORE UPDATE ON public.site_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_pages (id, heading, body, meta_title, meta_description, status)
VALUES (
  'about',
  'A kitchen notebook for people who read the label before the menu.',
  E'I cook plant-based food at home, and I write down what actually works.\n\n## Why this exists\n\nMost vegan recipe sites assume you''re doing it for one reason. In practice the people reading this are a mix: some have a dairy allergy or a soy allergy and no choice at all, some are cutting animal products for ethical or environmental reasons, and plenty are just cooking for someone else in the house. The food doesn''t need to be different for those groups — but the labelling does. That''s why every recipe here declares what it contains and lets you screen out what you can''t eat.\n\n## What I actually believe about vegan food\n\nIt isn''t a salad. It isn''t a compromise version of a real dish. A dal cooked properly, a fermented dosa, a mushroom risotto finished with good olive oil instead of butter — none of those are missing anything. The recipes here are the ones I make on ordinary weeknights, written out in enough detail that they work the first time.\n\n## Where I''m cooking from\n\nI''m based in India, so most of what I cook is what''s around me — that''s the part I know well. I''ve also travelled a little, including one week in northern Italy (Venice, Milan, Verona), and I kept notes on what was straightforward to order and what wasn''t. Those notes are one traveller''s week, not a guidebook, and the journal says so plainly.\n\n## How recipes get checked\n\nEvery recipe, including the ones readers submit, is screened for non-plant ingredients before it can be published, and reviewed by hand after that. Allergens are declared per recipe, with a notes field for the awkward cases — shared equipment, trace sesame, that sort of thing. If something is wrong, I''d rather hear about it and fix it.\n\n## Submit something\n\nIf you cook something worth sharing, send it in. Recipes come with ingredients, method, cookware and allergen information, and go live once they''ve been reviewed.',
  'About — Who Writes Vegan Cook, and Why',
  'Vegan Cook is written for people cooking plant-based by allergy or by choice — how the recipes are checked and why allergens are declared on every one.',
  'published'
);