


$.getJSON("macbook.json", function (json) {
    console.log(json); // this will show the info it in firebug console
    var winHeight = window.innerHeight;
    var animDuration = winHeight * 4;
    var animData = {
        container: document.getElementById('container'),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: json,
    };

    var anim = bodymovin.loadAnimation(animData);
    window.addEventListener('scroll', function () {
        animatebodymovin(animDuration, anim);
    });

    function animatebodymovin(duration, animObject) {
        var scrollPosition = window.scrollY;
        var maxFrames = animObject.totalFrames;
        var frame = (maxFrames / 100) * (scrollPosition / (duration / 100));
        animObject.goToAndStop(frame, true);
    }

});