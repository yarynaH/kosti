function initHomepageSlider() {
  $(".homepage_slider").slick({
    dots: true,
    arrows: false,
    autoplaySpeed: 3000,
    autoplay: true
  });
}
$(document).ready(function () {
  initHomepageSlider();
});
