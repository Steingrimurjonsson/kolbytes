$(function () {
  $('a[href*=\\#]').on('click', function () {
    $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top }, 500, 'linear');

  });
  $("section").mouseenter(function () {
    var id = $(this).attr('id');
    $('.but').removeClass('active');
    $('a.but[href="#' + id + '"]').addClass('active');
  });

});
