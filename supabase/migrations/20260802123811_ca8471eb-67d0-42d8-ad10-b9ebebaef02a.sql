CREATE TYPE public.journal_tag AS ENUM ('Travel', 'Allergies', 'Alternatives', 'Essay');

CREATE TABLE public.journal_posts (
  id text NOT NULL PRIMARY KEY,
  title text NOT NULL,
  tag public.journal_tag NOT NULL DEFAULT 'Essay',
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  cover_url text,
  cover_alt text,
  author text NOT NULL DEFAULT 'Vegan Cook',
  published_at date NOT NULL DEFAULT ((now() AT TIME ZONE 'utc'))::date,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.journal_posts TO anon;
GRANT SELECT ON public.journal_posts TO authenticated;
GRANT ALL ON public.journal_posts TO service_role;

ALTER TABLE public.journal_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published journal posts"
  ON public.journal_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can read all journal posts"
  ON public.journal_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages journal posts"
  ON public.journal_posts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_journal_posts_updated_at
  BEFORE UPDATE ON public.journal_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.journal_posts (id, title, tag, excerpt, body, status, published_at) VALUES
(
  'ordering-vegan-venice-milan-verona',
  'Ordering vegan in Venice, Milan and Verona',
  'Travel',
  'What actually works when you order plant-based in northern Italy: the phrases that land, the dishes that are already vegan, and the traps hiding in the sauce.',
  E'Northern Italy has a reputation for being difficult if you do not eat animal products. It is not, once you know what to ask for.\n\n## The phrase that does the work\n\n"Senza latticini, senza uova, senza pesce" — without dairy, without eggs, without fish. Say all three. "Vegano" alone often gets read as vegetarian.\n\n## Venice\n\nWrite about the bacaro culture here: which cicchetti are safe, where the fish stock hides, and the pasta e fagioli question.\n\n## Milan\n\nNotes on the aperitivo spread, risotto made with butter and stock, and where the reliable places are.\n\n## Verona\n\nNotes on polenta, the grilled vegetable plates, and asking for the pasta water version of a sauce.\n\n## What to avoid without asking\n\n- Anything described as "cremoso"\n- Fresh pasta, which is usually egg-based\n- Pesto, unless they confirm the cheese is left out',
  'draft',
  '2026-08-02'
),
(
  'eating-vegan-in-india',
  'Eating vegan in India: what is already plant-based, and what is not',
  'Travel',
  'Most of the Indian menu is closer to vegan than people expect. The gap is almost always ghee, paneer, curd or cream — and each one has a workaround.',
  E'A lot of Indian cooking is plant-based by default. The problem is not the spice list, it is the finish: a spoon of ghee, a swirl of cream, a side of curd.\n\n## Already vegan, most of the time\n\nDosa, idli, sambar, most dals, chana masala, bhindi, jeera aloo, plain rice and rotis made without ghee.\n\n## The four things to ask about\n\n1. Ghee — used in tempering and brushed on breads\n2. Paneer — obvious, but it also turns up in mixed vegetable dishes\n3. Curd — in marinades and raita\n4. Cream — in anything "makhani" or "shahi"\n\n## Regional notes\n\nWrite your own observations by region here.\n\n## Ordering language\n\nAsk for oil instead of ghee, and say no to the butter finish before the dish leaves the kitchen — after it arrives it is too late.',
  'draft',
  '2026-08-02'
),
(
  'dairy-allergy-milk-alternatives',
  'Dairy allergy: what to avoid, and how oat, almond and soy milk compare',
  'Alternatives',
  'A practical guide to reading labels when dairy is not an option, plus an honest comparison of the three most common plant milks against cow milk.',
  E'If dairy is a medical problem rather than a preference, the label matters more than the menu.\n\n## Names that mean dairy\n\nCasein, caseinate, whey, lactose, lactalbumin, ghee, curd, milk solids, milk powder. All of them are dairy, whatever the front of the pack says.\n\n## Where it hides\n\nBread glazes, crisps and flavoured snacks, instant soups, chocolate labelled "dark", and most restaurant mashed or creamed vegetables.\n\n## Oat milk\n\nCreamy, neutral, foams well, higher in carbohydrate. Best for coffee and baking. Not suitable if you also avoid gluten unless it says gluten-free.\n\n## Almond milk\n\nThin and low in calories, low in protein. Good in cereal and smoothies. Off the table if tree nuts are a problem.\n\n## Soy milk\n\nClosest to cow milk on protein, holds up in cooking, distinct flavour. A common allergen in its own right.\n\n## Compared with cow milk\n\nCow milk carries protein and calcium without fortification. Plant milks need to be fortified to match on calcium and B12 — check that the carton says so, and buy the unsweetened version.',
  'draft',
  '2026-08-02'
);