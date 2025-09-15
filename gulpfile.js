const gulp = require('gulp');

function buildIcons() {
	return gulp.src('nodes/**/*.{png,svg}')
		.pipe(gulp.dest('dist/nodes'));
}

exports.build = buildIcons;
exports['build:icons'] = buildIcons;