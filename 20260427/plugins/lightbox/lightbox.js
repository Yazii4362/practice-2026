(function($) {
    $.fn.lightbox = function(options) {
        var settings = $.extend({
            gallery: true,
            keyboard: true,
            closeOnOverlay: true
        }, options);

        var $images = this;
        var currentIndex = 0;
        var $overlay, $content, $img, $close, $prev, $next, $counter;

        function createLightbox() {
            $overlay = $('<div class="lightbox-overlay"></div>');
            $content = $('<div class="lightbox-content"></div>');
            $img = $('<img class="lightbox-image">');
            $close = $('<button class="lightbox-close">&times;</button>');
            $counter = $('<div class="lightbox-counter"></div>');

            if (settings.gallery && $images.length > 1) {
                $prev = $('<button class="lightbox-nav lightbox-prev">&#8249;</button>');
                $next = $('<button class="lightbox-nav lightbox-next">&#8250;</button>');
                $content.append($prev, $next);
            }

            $content.append($img, $close, $counter);
            $overlay.append($content);
            $('body').append($overlay);

            bindEvents();
        }

        function bindEvents() {
            $close.on('click', closeLightbox);

            if (settings.closeOnOverlay) {
                $overlay.on('click', function(e) {
                    if (e.target === this) closeLightbox();
                });
            }

            if (settings.gallery && $images.length > 1) {
                $prev.on('click', showPrev);
                $next.on('click', showNext);
            }

            if (settings.keyboard) {
                $(document).on('keydown.lightbox', function(e) {
                    if (!$overlay.hasClass('active')) return;
                    if (e.keyCode === 27) closeLightbox();
                    if (e.keyCode === 37) showPrev();
                    if (e.keyCode === 39) showNext();
                });
            }
        }

        function openLightbox(index) {
            currentIndex = index;
            var src = $images.eq(index).attr('data-lightbox') || $images.eq(index).attr('src');
            $img.attr('src', src);
            updateCounter();
            $overlay.addClass('active');
            $('body').css('overflow', 'hidden');
        }

        function closeLightbox() {
            $overlay.removeClass('active');
            $('body').css('overflow', '');
            setTimeout(function() {
                $img.attr('src', '');
            }, 300);
        }

        function showPrev() {
            if ($images.length <= 1) return;
            currentIndex = (currentIndex - 1 + $images.length) % $images.length;
            var src = $images.eq(currentIndex).attr('data-lightbox') || $images.eq(currentIndex).attr('src');
            $img.attr('src', src);
            updateCounter();
        }

        function showNext() {
            if ($images.length <= 1) return;
            currentIndex = (currentIndex + 1) % $images.length;
            var src = $images.eq(currentIndex).attr('data-lightbox') || $images.eq(currentIndex).attr('src');
            $img.attr('src', src);
            updateCounter();
        }

        function updateCounter() {
            if ($images.length > 1) {
                $counter.text((currentIndex + 1) + ' / ' + $images.length);
            }
        }

        createLightbox();

        $images.each(function(index) {
            $(this).css('cursor', 'pointer').on('click', function() {
                openLightbox(index);
            });
        });

        return this;
    };
})(jQuery);
