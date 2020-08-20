(function() {
  const rotateWrapper = document.querySelector('.rotate-wrapper');
  const rotate = document.querySelector('.rotate');
  const perRad = Math.PI / 180;
  const angleRange = 360 * perRad;
  const rotateWrapperRect = rotateWrapper.getBoundingClientRect();

  let rmdown = false;

  const eventRotate = new Event('eventRotate');
  const computeRateWidth = (e) => {
    console.log(e, e.target);
    const { left, top } = rotateWrapperRect;
    const currentX = e.screenX;
    const currentY = e.screenY;
  }
  rotateWrapper.addEventListener('eventRotate', computeRateWidth);

  rotateWrapper.addEventListener('mousedown', (e) => {
    rotateWrapper.dispatchEvent(eventRotate);
    // console.log(e, e.target);
    rmdown = true;
  });
  rotateWrapper.addEventListener('mouseup', () => {
    rmdown = false;
  });
  rotateWrapper.addEventListener('mousemove', (e) => {
    if(rmdown) {

    }
  })
}());