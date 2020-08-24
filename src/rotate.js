(function() {
  const rotateWrapper = document.querySelector('.rotate-wrapper');
  const rotate = document.querySelector('.rotate');
  const perRad = Math.PI / 180;
  const angleRange = 360;
  const rotateWrapperRect = rotateWrapper.getBoundingClientRect();
  
  let radRotate = 0;
  let rmdown = false;

  document.addEventListener('originChange', () => {
    radRotate = 0;
    pageClipVars.radRotate = 0;
  });

  const computeRateWidth = (e) => {
    const { left, width, } = rotateWrapperRect;
    const currentX = e.screenX;
    
    let delta = currentX - left;
    
    if (delta < 0) {
      delta = 0;
    } else if (delta > width) {
      delta = width;
    }
    // 计算旋转弧度
    const rotateAngle = delta / width * angleRange;
    radRotate = rotateAngle * perRad;
    rotate.style.width = `${delta}px`;
    document.querySelector('.rotate-tip').innerHTML = `${rotateAngle.toFixed(2)} deg`;
  }

  rotateWrapper.addEventListener('mousedown', (e) => {
    if (pageClipVars.imageUrl) {
      computeRateWidth(e);
      rmdown = true;
      rotate.classList.add('show');
      rotateCanvas();
    }
  });

  const rotateCanvas = () => {
    const context = pageClipVars.context;
    const zoomSize = pageClipVars.zoomSize;
    const imgSrc = pageClipVars.imgSrc;

    if (context && zoomSize) {
      context.save();

      const { width, height, } = zoomSize;
      const length = Math.sqrt(width**2 + height**2);

      context.clearRect(0, 0, length, length);
      context.translate(length / 2, length / 2);
      context.rotate(radRotate);
      context.scale(pageClipVars.flipX, pageClipVars.flipY);
      
      context.drawImage(imgSrc, -width / 2, -height / 2, width, height);

      context.restore();

      pageClipVars.radRotate = radRotate;
    }
  }
  const rotateMove = () => {
    let flag = null;
    return (e) => {
      e.preventDefault();
      if (pageClipVars.imageUrl) {
        rotateWrapper.classList.remove('disabled');
      }
      if (!flag && pageClipVars.imageUrl) {
        flag = setTimeout(() => {
          if (rmdown) {
            computeRateWidth(e);
            rotateCanvas();
          }
          flag = null;
        }, 60);
      }
    }
  };
  document.addEventListener('mousemove', rotateMove());
  document.addEventListener('mouseup', () => {
    rmdown = false;
    rotate.classList.remove('show');
  });
}());