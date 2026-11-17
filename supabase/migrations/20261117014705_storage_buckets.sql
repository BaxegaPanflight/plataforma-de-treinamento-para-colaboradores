-- Buckets de Storage usados pelo app (o export do Lovable trouxe só as policies de storage.objects).
-- Todos públicos porque o front-end e as Edge Functions usam getPublicUrl().
INSERT INTO storage.buckets (id, name, public) VALUES
  ('branding',      'branding',      true),
  ('certificates',  'certificates',  true),
  ('course-assets', 'course-assets', true),
  ('lesson-files',  'lesson-files',  true),
  ('public',        'public',        true)
ON CONFLICT (id) DO NOTHING;
