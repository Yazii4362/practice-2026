(function($) {
    $.fn.imageZoom = function(options) {
        var settings = $.extend({
            type: 'inner',
            scale: 2,
            lensSize: 100,
            resultWidth: 300,
            resultHeight: 300
        }, options);

        return this.each(function() {
            var $img = $(this);
            var $container = $img.parent();

            if (settings.type === 'inner') {
                initInnerZoom($img, $container);
            } else if (settings.type === 'lens') {
                initLensZoom($img, $container);
            }
        });

        function initInnerZoom($img, $container) {
            $container.addClass('zoom-container');

            $container.on('click', function() {
                $(this).toggleClass('zoomed');
            });

            $container.on('mousemove', function(e) {
                if (!$(this).hasClass('zoomed')) return;

                var offset = $(this).offset();
                var x = (e.pageX - offset.left) / $(this).width();
                var y = (e.pageY - offset.top) / $(this).height();

                var transformX = (0.5 - x) * 100;
                var transformY = (0.5 - y) * 100;

                $img.css('transform-origin', (x * 100) + '% ' + (y * 100) + '%');
            });

            $container.on('mouseleave', function() {
                $(this).removeClass('zoomed');
            });
        }

        function initLensZoom($img, $container) {
            $container.addClass('zoom-container');

            var $lens = $('<div class="zoom-lens"></div>');
            var $result = $('<div class="zoom-result"></div>');
            var $zoomImg = $('<img>').attr('src', $img.attr('src'));

            $lens.css({
                width: settings.lensSize + 'px',
                height: settings.lensSize + 'px'
            });

            $result.css({
                width: settings.resultWidth + 'px',
                height: settings.resultHeight + 'px',
                left: $container.outerWidth() + 10 + 'px',
                top: 0
            });

            $result.append($zoomImg);
            $container.append($lens, $result);

            var cx = settings.resultWidth / settings.lensSize;
            var cy = settings.resultHeight / settings.lensSize;

            $zoomImg.css({
                width: $img.width() * cx + 'px',
                height: $img.height() * cy + 'px'
            });

            $container.on('mouseenter', function() {
                $lens.show();
                $result.show();
            });

            $container.on('mousemove', function(e) {
                var offset = $container.offset();
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;

                x = Math.max(settings.lensSize / 2, Math.min(x, $container.width() - settings.lensSize / 2));
                y = Math.max(settings.lensSize / 2, Math.min(y, $container.height() - settings.lensSize / 2));

                $lens.css({
                    left: x - settings.lensSize / 2 + 'px',
                    top: y - settings.lensSize / 2 + 'px'
                });

                $zoomImg.css({
                    left: -(x * cx - settings.resultWidth / 2) + 'px',
                    top: -(y * cy - settings.resultHeight / 2) + 'px'
                });
            });

            $container.on('mouseleave', function() {
                $lens.hide();
                $result.hide();
            });
        }
    };
})(jQuery);
