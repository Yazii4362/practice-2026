(function($) {
    $.fn.rotator = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var args = Array.prototype.slice.call(arguments, 1);
            return this.each(function() {
                var instance = $(this).data('rotator');
                if (instance && typeof instance[method] === 'function') {
                    instance[method].apply(instance, args);
                }
            });
        }

        var settings = $.extend({
            autoplay: true,
            speed: 600,
            delay: 3000,
            loop: true,
            effect: 'slide'
        }, options);

        return this.each(function() {
            var $rotator = $(this);
            var $slides = $rotator.find('.rotator-slide');
            var currentIndex = 0;
            var slideCount = $slides.length;
            var autoplayInterval;

            var rotatorInstance = {
                init: function() {
                    $slides.eq(0).addClass('active');
                    this.createIndicators();
                    if (settings.autoplay) {
                        this.startAutoplay();
                    }
                },

                createIndicators: function() {
                    var $indicators = $('<div class="rotator-indicators"></div>');
                    for (var i = 0; i < slideCount; i++) {
                        var $indicator = $('<span class="rotator-indicator"></span>');
                        if (i === 0) $indicator.addClass('active');
                        $indicator.data('index', i);
                        $indicators.append($indicator);
                    }
                    $rotator.append($indicators);

                    $rotator.on('click', '.rotator-indicator', function() {
                        var index = $(this).data('index');
                        rotatorInstance.goToSlide(index);
                    });
                },

                goToSlide: function(index) {
                    if (index === currentIndex) return;

                    $slides.eq(currentIndex).removeClass('active').addClass('prev');
                    $slides.eq(index).removeClass('prev').addClass('active');

                    setTimeout(function() {
                        $slides.eq(currentIndex).removeClass('prev');
                    }, settings.speed);

                    $rotator.find('.rotator-indicator').eq(currentIndex).removeClass('active');
                    $rotator.find('.rotator-indicator').eq(index).addClass('active');

                    currentIndex = index;

                    if (settings.autoplay) {
                        this.resetAutoplay();
                    }
                },

                next: function() {
                    var nextIndex = (currentIndex + 1) % slideCount;
                    if (!settings.loop && nextIndex === 0) return;
                    this.goToSlide(nextIndex);
                },

                prev: function() {
                    var prevIndex = (currentIndex - 1 + slideCount) % slideCount;
                    if (!settings.loop && currentIndex === 0) return;
                    this.goToSlide(prevIndex);
                },

                startAutoplay: function() {
                    var self = this;
                    autoplayInterval = setInterval(function() {
                        self.next();
                    }, settings.delay);
                },

                stopAutoplay: function() {
                    clearInterval(autoplayInterval);
                },

                resetAutoplay: function() {
                    this.stopAutoplay();
                    this.startAutoplay();
                }
            };

            rotatorInstance.init();
            $rotator.data('rotator', rotatorInstance);
        });
    };
})(jQuery);
