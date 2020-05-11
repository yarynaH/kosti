function initHomepageSlider() {
  $(".homepage_slider").slick({
    dots: true,
    arrows: false,
    autoplaySpeed: 1000,
    autoplay: true
  });
}
$(document).ready(function () {
  initHomepageSlider();
});
