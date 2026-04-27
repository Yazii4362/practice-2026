(function($) {
    $.fn.xzoom = function(options) {
        var settings = $.extend({
            position: 'right',
            mposition: 'inside',
            rootOutput: true,
            Xoffset: 0,
            Yoffset: 0,
            fadeIn: true,
            fadeTrans: true,
            fadeOut: false,
            smooth: true,
            smoothZoomMove: 3,
            smoothLensMove: 1,
            smoothScale: 6,
            defaultScale: 0,
            scroll: true,
            tint: false,
            tintOpacity: 0.5,
            lens: false,
            lensOpacity: 0.5,
            lensShape: 'box',
            zoomWidth: 'auto',
            zoomHeight: 'auto',
            sourceClass: 'xzoom-source',
            loadingClass: 'xzoom-loading',
            lensClass: 'xzoom-lens',
            zoomClass: 'xzoom-preview',
            activeClass: 'xactive',
            hover: false,
            adaptive: true,
            lensReverse: false,
            adaptiveReverse: false,
            lensCollision: true,
            title: false,
            titleClass: 'xzoom-caption',
            bg: false
        }, options);

        return this.each(function() {
            var $source = $(this);
            var $container = $source.parent();
            var $zoomWindow, $lensDiv, $titleDiv;
            var isActive = false;
            var currentScale = settings.defaultScale;

            var originalSrc = $source.attr('xoriginal') || $source.attr('src');
            var $gallery = $('.xzoom-gallery');

            init();

            function init() {
                $source.wrap('<div class="' + settings.sourceClass + '"></div>');
                $container = $source.parent();

                createZoomWindow();
                createLens();
                bindEvents();
                bindGalleryEvents();
            }

            function createZoomWindow() {
                $zoomWindow = $('<div class="' + settings.zoomClass + '"></div>');
                
                if (settings.zoomWidth !== 'auto') {
                    $zoomWindow.css('width', settings.zoomWidth);
                }
                if (settings.zoomHeight !== 'auto') {
                    $zoomWindow.css('height', settings.zoomHeight);
                }

                if (settings.title) {
                    $titleDiv = $('<div class="' + settings.titleClass + '"></div>');
                    $zoomWindow.append($titleDiv);
                }

                if (settings.rootOutput) {
                    $('body').append($zoomWindow);
                } else {
                    $container.append($zoomWindow);
                }

                positionZoomWindow();
            }

            function createLens() {
                if (settings.lens) {
                    $lensDiv = $('<div class="' + settings.lensClass + '"></div>');
                    $lensDiv.css({
                        opacity: settings.lensOpacity,
                        borderRadius: settings.lensShape === 'circle' ? '50%' : '0'
                    });
                    $container.append($lensDiv);
                }
            }

            function positionZoomWindow() {
                var offset = $source.offset();
                var sourceWidth = $source.outerWidth();
                var sourceHeight = $source.outerHeight();
                var zoomWidth = $zoomWindow.outerWidth();
                var zoomHeight = $zoomWindow.outerHeight();

                var css = {};

                switch(settings.position) {
                    case 'right':
                        css = {
                            top: offset.top + settings.Yoffset,
                            left: offset.left + sourceWidth + 10 + settings.Xoffset
                        };
                        break;
                    case 'left':
                        css = {
                            top: offset.top + settings.Yoffset,
                            left: offset.left - zoomWidth - 10 + settings.Xoffset
                        };
                        break;
                    case 'top':
                        css = {
                            top: offset.top - zoomHeight - 10 + settings.Yoffset,
                            left: offset.left + settings.Xoffset
                        };
                        break;
                    case 'bottom':
                        css = {
                            top: offset.top + sourceHeight + 10 + settings.Yoffset,
                            left: offset.left + settings.Xoffset
                        };
                        break;
                    case 'inside':
                        css = {
                            top: offset.top + settings.Yoffset,
                            left: offset.left + settings.Xoffset
                        };
                        $zoomWindow.css({
                            width: sourceWidth,
                            height: sourceHeight
                        });
                        break;
                }

                if (settings.position !== 'inside') {
                    $zoomWindow.css(css);
                }
            }

            function bindEvents() {
                $source.on('mouseenter', function() {
                    showZoom();
                });

                $source.on('mousemove', function(e) {
                    if (!isActive) return;
                    updateZoom(e);
                });

                $source.on('mouseleave', function() {
                    hideZoom();
                });

                if (settings.scroll) {
                    $source.on('wheel', function(e) {
                        e.preventDefault();
                        var delta = e.originalEvent.deltaY;
                        currentScale += delta > 0 ? -0.1 : 0.1;
                        currentScale = Math.max(-1, Math.min(1, currentScale));
                    });
                }
            }

            function bindGalleryEvents() {
                var eventType = settings.hover ? 'mouseenter' : 'click';

                $gallery.on(eventType, function(e) {
                    e.preventDefault();
                    
                    $gallery.removeClass(settings.activeClass);
                    $(this).addClass(settings.activeClass);

                    var newPreview = $(this).attr('xpreview') || $(this).attr('src');
                    var newOriginal = $(this).parent('a').attr('href') || $(this).attr('xoriginal');

                    if (settings.fadeTrans) {
                        $source.fadeOut(200, function() {
                            $source.attr('src', newPreview);
                            $source.attr('xoriginal', newOriginal);
                            originalSrc = newOriginal;
                            $source.fadeIn(200);
                        });
                    } else {
                        $source.attr('src', newPreview);
                        $source.attr('xoriginal', newOriginal);
                        originalSrc = newOriginal;
                    }

                    if (isActive) {
                        updateZoomImage();
                    }
                });

                $gallery.first().addClass(settings.activeClass);
            }

            function showZoom() {
                isActive = true;
                
                if (settings.fadeIn) {
                    $zoomWindow.fadeIn(200);
                } else {
                    $zoomWindow.show();
                }

                if ($lensDiv) {
                    $lensDiv.show();
                }

                updateZoomImage();
            }

            function hideZoom() {
                isActive = false;
                
                if (settings.fadeOut) {
                    $zoomWindow.fadeOut(200);
                } else {
                    $zoomWindow.hide();
                }

                if ($lensDiv) {
                    $lensDiv.hide();
                }
            }

            function updateZoom(e) {
                var offset = $source.offset();
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;

                var sourceWidth = $source.outerWidth();
                var sourceHeight = $source.outerHeight();

                var xPercent = x / sourceWidth;
                var yPercent = y / sourceHeight;

                if (settings.lensCollision) {
                    xPercent = Math.max(0, Math.min(1, xPercent));
                    yPercent = Math.max(0, Math.min(1, yPercent));
                }

                var $zoomImg = $zoomWindow.find('img');
                if ($zoomImg.length) {
                    var imgWidth = $zoomImg.width();
                    var imgHeight = $zoomImg.height();
                    var zoomWidth = $zoomWindow.width();
                    var zoomHeight = $zoomWindow.height();

                    var moveX = -(imgWidth - zoomWidth) * xPercent;
                    var moveY = -(imgHeight - zoomHeight) * yPercent;

                    if (settings.smooth) {
                        $zoomImg.css({
                            transition: 'all ' + (settings.smoothZoomMove * 0.01) + 's ease'
                        });
                    }

                    if (settings.bg) {
                        $zoomWindow.css({
                            backgroundPosition: moveX + 'px ' + moveY + 'px'
                        });
                    } else {
                        $zoomImg.css({
                            left: moveX + 'px',
                            top: moveY + 'px'
                        });
                    }
                }

                if ($lensDiv) {
                    var lensWidth = $lensDiv.outerWidth();
                    var lensHeight = $lensDiv.outerHeight();
                    
                    var lensX = x - lensWidth / 2;
                    var lensY = y - lensHeight / 2;

                    if (settings.lensCollision) {
                        lensX = Math.max(0, Math.min(sourceWidth - lensWidth, lensX));
                        lensY = Math.max(0, Math.min(sourceHeight - lensHeight, lensY));
                    }

                    $lensDiv.css({
                        left: lensX + 'px',
                        top: lensY + 'px'
                    });
                }

                if (settings.tint) {
                    updateTint(xPercent, yPercent);
                }
            }

            function updateZoomImage() {
                var scale = 1 + currentScale;
                var imgHtml = settings.bg ? '' : '<img src="' + originalSrc + '" style="position: absolute;">';
                
                $zoomWindow.html(imgHtml);

                if (settings.bg) {
                    $zoomWindow.css({
                        backgroundImage: 'url(' + originalSrc + ')',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat'
                    });
                }

                if (settings.title) {
                    var titleText = $source.attr('xtitle') || $source.attr('title') || '';
                    if (!$titleDiv) {
                        $titleDiv = $('<div class="' + settings.titleClass + '"></div>');
                        $zoomWindow.append($titleDiv);
                    }
                    $titleDiv.text(titleText);
                }
            }

            function updateTint(xPercent, yPercent) {
                // Tint effect implementation
            }
        });
    };
})(jQuery);
