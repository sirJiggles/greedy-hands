
# Set this to the root of your project when deployed:
http_path = ''
css_dir = 'assets/css'
sass_dir = 'assets/sass'
add_import_path 'assets/sass/views'
images_dir = 'assets/img'
javascripts_dir = 'assets/js'

relative_assets = true

# You can select your preferred output style here (can be overridden via the command line):
output_style = :compact

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false

disable_warnings = true

output_style = (environment == :production) ? :compressed : :expanded
asset_cache_buster :none
