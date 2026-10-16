-- Media library: no SVG uploads. SVG files can carry scripts and the bucket is public, so only
-- raster image types are accepted (also enforced by the upload action).
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
where id = 'media';
