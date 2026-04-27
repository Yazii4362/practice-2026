$(document).ready(function() {
    // Rotator Plugin
    $('#myRotator').rotator({
        autoplay: true,
        speed: 800,
        delay: 3000,
        loop: true,
        effect: 'slide'
    });

    $('#prevBtn').click(function() {
        $('#myRotator').rotator('prev');
    });

    $('#nextBtn').click(function() {
        $('#myRotator').rotator('next');
    });

    // Lightbox Plugin
    $('.gallery-grid img').lightbox({
        gallery: true,
        keyboard: true,
        closeOnOverlay: true
    });

    // xZoom Plugin
    $('.xzoom').xzoom({
        position: 'right',
        Xoffset: 10,
        Yoffset: 0,
        fadeIn: true,
        fadeTrans: true,
        smooth: true,
        smoothZoomMove: 3,
        lens: true,
        lensOpacity: 0.5,
        lensShape: 'box',
        title: true,
        hover: false,
        scroll: true
    });

    // Zoom Plugin - Inner Zoom
    $('#innerZoom').imageZoom({
        type: 'inner',
        scale: 2
    });

    // Zoom Plugin - Lens Zoom
    $('#lensZoom').imageZoom({
        type: 'lens',
        lensSize: 100,
        resultWidth: 300,
        resultHeight: 300
    });
});
