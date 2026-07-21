<?php
/**
 * MedTech For Solutions — Divi Child Theme
 *
 * - Enqueues the Divi parent stylesheet, this child theme's style.css,
 *   and the consolidated site stylesheet (mtfs-global.css) in the correct
 *   cascade order.
 * - Serves the bundled /site-assets/ imagery (page photos, logo, favicon)
 *   at the root-relative /site-assets/... URLs the page markup uses, so no
 *   FTP upload to the web root is required.
 *
 * Compatible with Divi 5 (works on Divi 4.x as well — the child-theme
 * mechanics are identical; Divi 5's builder reads the same Template header).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* --------------------------------------------------------------------------
 * Stylesheets
 * ------------------------------------------------------------------------ */
add_action( 'wp_enqueue_scripts', function () {
	$parent_handle = 'divi-parent-style';

	// Divi parent stylesheet.
	wp_enqueue_style(
		$parent_handle,
		get_template_directory_uri() . '/style.css',
		array(),
		wp_get_theme( get_template() )->get( 'Version' )
	);

	// Child theme style.css (small ad-hoc overrides).
	wp_enqueue_style(
		'medtech-child-style',
		get_stylesheet_uri(),
		array( $parent_handle ),
		wp_get_theme()->get( 'Version' )
	);

	// Consolidated site stylesheet for all converted page Code modules.
	wp_enqueue_style(
		'mtfs-global',
		get_stylesheet_directory_uri() . '/mtfs-global.css',
		array( 'medtech-child-style' ),
		wp_get_theme()->get( 'Version' )
	);
}, 20 );

/* --------------------------------------------------------------------------
 * Fonts — resource hints for the Google Fonts loaded by the page styles.
 * ------------------------------------------------------------------------ */
add_filter( 'wp_resource_hints', function ( $urls, $relation_type ) {
	if ( 'preconnect' === $relation_type ) {
		$urls[] = array(
			'href' => 'https://fonts.gstatic.com',
			'crossorigin',
		);
		$urls[] = 'https://fonts.googleapis.com';
	}
	return $urls;
}, 10, 2 );

/* --------------------------------------------------------------------------
 * /site-assets/ passthrough
 *
 * The converted pages reference imagery with root-relative URLs
 * (/site-assets/mtfs-....jpg|webp|png). This routes those requests to the
 * copies bundled inside this child theme, so activating the theme is enough
 * — no files need to be placed in the web root. If a real /site-assets/
 * directory exists in the web root, the web server serves it first and this
 * fallback never runs.
 * ------------------------------------------------------------------------ */
add_action( 'init', function () {
	add_rewrite_rule( '^site-assets/([^/]+)$', 'index.php?mtfs_site_asset=$matches[1]', 'top' );
} );

add_filter( 'query_vars', function ( $vars ) {
	$vars[] = 'mtfs_site_asset';
	return $vars;
} );

add_action( 'parse_request', function ( $wp ) {
	if ( empty( $wp->query_vars['mtfs_site_asset'] ) ) {
		return;
	}

	// Sanitize: bare filename only — no traversal, no subpaths.
	$file = basename( (string) $wp->query_vars['mtfs_site_asset'] );
	$path = get_stylesheet_directory() . '/site-assets/' . $file;

	if ( ! preg_match( '/^[A-Za-z0-9._-]+\.(jpe?g|png|webp|svg|ico|gif|avif)$/', $file ) || ! is_file( $path ) ) {
		status_header( 404 );
		exit;
	}

	$types = array(
		'jpg'  => 'image/jpeg',
		'jpeg' => 'image/jpeg',
		'png'  => 'image/png',
		'webp' => 'image/webp',
		'svg'  => 'image/svg+xml',
		'ico'  => 'image/x-icon',
		'gif'  => 'image/gif',
		'avif' => 'image/avif',
	);
	$ext = strtolower( pathinfo( $file, PATHINFO_EXTENSION ) );

	header( 'Content-Type: ' . $types[ $ext ] );
	header( 'Content-Length: ' . filesize( $path ) );
	header( 'Cache-Control: public, max-age=31536000, immutable' );
	readfile( $path );
	exit;
} );

// Flush rewrite rules once on activation so /site-assets/ resolves immediately.
add_action( 'after_switch_theme', function () {
	flush_rewrite_rules();
} );
