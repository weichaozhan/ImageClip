!function(){
  const mouseCoordinate = {
    x: 0,
    y: 0,
  };
  const inputUpload = document.querySelector('#upload');
  const canvasWrapper = document.querySelector('#canvas-wrapper');
  const rectClip = document.querySelector('#imgClip');
  const canvas = document.querySelector('#canvas');
  const cHeight = canvas.clientHeight;
  const cWidth = canvas.clientWidth;
  const context = canvas.getContext('2d');
  
  let animationDoing = null;
  
  let imgSrc = new Image();
  // 图片原始长宽
  let originImgW;
  let originImgH;
  // 记录缩放后的图片尺寸
  let zoomSize = {
    height: 0,
    width: 0,
  };

  let imageUrl;

  const resetPageVars = () => {
    pageClipVars = Object.assign(pageClipVars, {
      mouseCoordinate,
      canvas,
      imgSrc,
      zoomSize,
      imageUrl,
      context,
    });
  };
  const resetChange = () => {
    resetPageVars();
    pageClipVars = Object.assign(pageClipVars, {
      radRotate: 0,
      flipX: 1,
      flipY: 1
    });
  };
  
  document.querySelector('#upload-btn').addEventListener('click', () => {
    inputUpload.click();
  });

  document.addEventListener('originChange', () => {
    zoomSize.height = originImgH;
    zoomSize.width = originImgW;
    canvas.style.top = 0;
    canvas.style.left = 0;
  });

  /**
   * file 操作 
   */
  const getObjectUrl = (file) => {
    const url = URL.createObjectURL(file);
    return url;
  }

  const getCustomComputedStyle = (dom, styles) => {
    const style = window.getComputedStyle(dom);
    const styleMap = {};

    styles.forEach(name => {
      styleMap[name] = parseFloat(style[name]);
    });

    return styleMap;
  }

  inputUpload.addEventListener('change', (e) => {
    if (!e.target.value) {
      return;
    }

    const file = e.target.files[0];
    imageUrl = getObjectUrl(file);
    
    imgSrc.src = imageUrl;
    imgSrc.height = cHeight;
    imgSrc.width = cWidth;

    imgSrc.onload = () => {
      originImgW = imgSrc.naturalWidth;
      originImgH = imgSrc.naturalHeight;

      const length = Math.sqrt(originImgW**2 + originImgH**2);

      canvas.width = length;
      canvas.height = length;

      if (imgSrc) {
        context.clearRect(canvas.wid, 0, length, length);
      }

      document.dispatchEvent(originChange);
      context.drawImage(imgSrc, length / 2 - originImgW/2, length / 2 - originImgH / 2, originImgW, originImgH);
      
      const canvasStyle = getCustomComputedStyle(canvas, ['top', 'left']);
      const { top, left } = canvasStyle;

      canvas.style.top = `${top - (length / 2 - originImgH / 2)}px`;
      canvas.style.left = `${left - (length / 2 - originImgW/2)}px`;

      resetChange();
    };
  });

  // mousedown 操作 flag
  let canvasWrapperMD = false; // 图片拖拽
  let rcMouseDown = false; // 图片截取区拖拽
  let sizeMouseDown = false; // 图片截取区大小调整

  /**
   * canvas 操作
   */
  const moveImg = (e) => {
    let movementX = e.screenX - mouseCoordinate.x;
    let movementY = e.screenY - mouseCoordinate.y;

    mouseCoordinate.x = e.screenX;
    mouseCoordinate.y = e.screenY;
    
    const canvasStyle = window.getComputedStyle(canvas);
    let top = parseFloat(canvasStyle.top);
    let left = parseFloat(canvasStyle.left);

    canvas.style.top = `${top + movementY}px`;
    canvas.style.left = `${left + movementX}px`;
  }
  canvasWrapper.addEventListener('mousedown', (e) => {
    canvasWrapperMD = true;
    mouseCoordinate.x = e.screenX;
    mouseCoordinate.y = e.screenY;
    canvasWrapper.classList.add('grabbing');
  });
  canvasWrapper.addEventListener('mouseup', () => {
    canvasWrapper.classList.remove('grabbing');
  });
  // 滚轮事件
  const rectClipXYFlag = {
    x: 0,
    y: 0
  };
  const buildHandleMouseWheel = () => {
    let flag = null;

    return (e) => {
      e.preventDefault();
      if (!flag && imageUrl) {
        flag = setTimeout(() => {
          const deltaY = e.deltaY;
          const rePaint = (sign) => {
            context.save();

            const preW = zoomSize.width;
            const preH = zoomSize.height;

            zoomSize.height = sign * zoomSize.height;
            zoomSize.width = sign * zoomSize.width;

            const length = Math.sqrt(zoomSize.height**2 + zoomSize.width**2);

            
            canvas.width = length;
            canvas.height = length;
            
            context.clearRect(0, 0, length, length);

            const halfLenth = length / 2;
            context.translate(halfLenth, halfLenth);
            context.rotate(pageClipVars.radRotate);
            context.scale(sign * pageClipVars.flipX, sign * pageClipVars.flipY);
            context.drawImage(imgSrc, -(zoomSize.width / sign) / 2, -(zoomSize.height / sign) / 2, zoomSize.width / sign, zoomSize.height/ sign);
            context.restore();
            context.setTransform(1, 0, 0, 1, 0, 0);

            const canvasStyle = getCustomComputedStyle(canvas, ['top', 'left']);
            const { top, left } = canvasStyle;

            canvas.style.top = `${top - zoomSize.height + preH}px`;
            canvas.style.left = `${left - zoomSize.width + preW}px`;
          }

          if (deltaY > 0) {
            rePaint(0.8);
          } else {
            rePaint(1.2);
          }
          flag = null;
        }, 100);
      }
    };
  }
  canvasWrapper.addEventListener('mousewheel', buildHandleMouseWheel());

  // 截图事件
  const moveClip = (e) => {
    let movementX = e.screenX - mouseCoordinate.x;
    let movementY = e.screenY - mouseCoordinate.y;

    mouseCoordinate.x = e.screenX;
    mouseCoordinate.y = e.screenY;
    
    const wrapperStyle = window.getComputedStyle(canvasWrapper, null);
    let wrapperW = parseFloat(wrapperStyle.width),
        wrapperH = parseFloat(wrapperStyle.height);
    const styleClip = window.getComputedStyle(rectClip, null);
    let top = parseFloat(styleClip.top),
        left = parseFloat(styleClip.left),
        width = parseFloat(styleClip.width),
        height = parseFloat(styleClip.height);
    top = top + movementY;
    left = left + movementX;
    
    const maxTop = wrapperH - height - 4;
    const maxLeft = wrapperW - width - 4;

    if (top <= 0) {
      rectClip.style.top = `${0}px`;
    } else if (top >= (maxTop)) {
      rectClip.style.top = `${maxTop}px`;
    } else {
      rectClip.style.top = `${top}px`;
    }
    if (left <= 0) {
      rectClip.style.left = `${0}px`;
    } else if(left >= (maxLeft)) {
      rectClip.style.left = `${maxLeft}px`;
    } else {
      rectClip.style.left = `${left}px`;
    }
  }
  const resizeClip = (e) => {
    if (!animationDoing && animationDoing !== 0) {
      animationDoing = requestAnimationFrame(() => {
        const xFlag = rectClipXYFlag.x;
        const yFlag = rectClipXYFlag.y;
        let movementX = (e.screenX - mouseCoordinate.x) * xFlag;
        let movementY = (e.screenY - mouseCoordinate.y) * yFlag;
        
        mouseCoordinate.x = e.screenX;
        mouseCoordinate.y = e.screenY;
    
        const wrapperStyle = window.getComputedStyle(canvasWrapper, null);
        let wrapperW = parseFloat(wrapperStyle.width),
            wrapperH = parseFloat(wrapperStyle.height);
        const styleClip = window.getComputedStyle(rectClip, null);
        let top = parseFloat(styleClip.top),
            left = parseFloat(styleClip.left),
            width = parseFloat(styleClip.width) + movementX,
            height = parseFloat(styleClip.height) + movementY;
        
        if (width >= 30 && width <= wrapperW) {
          rectClip.style.width = `${width}px`;
          if (xFlag < 0) {
            rectClip.style.left = `${left - movementX}px`;
          }
        }
        if (height >= 30 && width <= wrapperH) {
          rectClip.style.height = `${height}px`;
          if (yFlag < 0) {
            rectClip.style.top = `${top - movementY}px`;
          }
        }
        animationDoing = null
      });
    }
  };

  rectClip.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const nodeClassList = e.target.classList;
    
    mouseCoordinate.x = e.screenX;
    mouseCoordinate.y = e.screenY;

    if ([...nodeClassList].includes('imgClip-resize')) {
      rectClipXYFlag.x = parseFloat(e.target.dataset.x);
      rectClipXYFlag.y = parseFloat(e.target.dataset.y);
      sizeMouseDown = true;
    } else {
      rcMouseDown = true;
      canvasWrapper.classList.add('grabbing');
    }
  });

  // mousemove
  const buildHandleMouseMove = () => {
    let flag = null;

    return (e) => {
      if (!flag) {
        flag = setTimeout(() => {
          if (sizeMouseDown) {
            resizeClip(e)
          } else if (rcMouseDown) {
            moveClip(e);
          } else if (imageUrl && canvasWrapperMD) {
            moveImg(e);
          }
          flag = null;
        }, 60);
      }
    }
  }
  canvasWrapper.addEventListener('mousemove', buildHandleMouseMove());
  
  document.addEventListener('mouseup', () => {
    canvasWrapperMD = false;
    rcMouseDown = false;
    sizeMouseDown = false;
  });

  /**
   * 翻转
   * @param {Event} e 
   * @param {Number} direct 1 水平 2 垂直
   */
  const handleFlip = (e, direct) => {
    e.preventDefault();
    if (imageUrl) {
      const deltaY = e.deltaY;
      context.save();

        const length = Math.sqrt(zoomSize.height**2 + zoomSize.width**2);

        
        canvas.width = length;
        canvas.height = length;
        
        context.clearRect(0, 0, length, length);

        const halfLenth = length / 2;
        context.translate(halfLenth, halfLenth);
        context.rotate(pageClipVars.radRotate);
        
        if (direct === 1) {
          pageClipVars.flipX *= -1;
        } else if (direct === 2) {
          pageClipVars.flipY *= -1;
        }
        
        context.scale(pageClipVars.flipX, pageClipVars.flipY);

        context.drawImage(imgSrc, -zoomSize.width / 2, -zoomSize.height / 2, zoomSize.width, zoomSize.height);
        context.restore();
        context.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      alert('请上传图片进行操作！');
    }
  }

  document.querySelector('#vertical-flip-btn').addEventListener('click', (e) => {
    handleFlip(e, 2);
  });
  document.querySelector('#horizontal-flip-btn').addEventListener('click', (e) => {
    handleFlip(e, 1);
  });
  
  
  const preview = document.querySelector('#preview');
  const previewCtx = preview.getContext('2d');
  
  const saveBtn = document.querySelector('#save-btn');
  
  // 裁剪
  document.querySelector('#clip-btn').addEventListener('click', () => {
    if (imageUrl) {
      const styleClip = window.getComputedStyle(rectClip, null);
      const top = parseFloat(styleClip.top);
      const left = parseFloat(styleClip.left);
      const width =parseFloat(styleClip.width);
      const height =parseFloat(styleClip.height);

      const canvasStyle = window.getComputedStyle(canvas);
      const cTop = parseFloat(canvasStyle.top);
      const cLeft = parseFloat(canvasStyle.left);
      
      preview.width = width;
      preview.height = height;
  
      const imgData = context.getImageData(left - cLeft, top - cTop, width, height);

      previewCtx.putImageData(imgData, 0, 0);

      saveBtn.classList.remove('btn-disabled');
      saveBtn.removeAttribute('disabled');
    } else {
      alert('请上传图片进行截图！');
    }
  });
  // 保存
  saveBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = preview.toDataURL();
    a.download = `cut_${Date.now()}`;

    a.click();
  });

  const buildHandleGlobalMouseMove = () => {
    let flag = null;

    return (e) => {
      if (!flag) {
        flag = setTimeout(() => {
          resetPageVars();
          flag = null;
        }, 60);
      }
    }
  }
  document.addEventListener('mousemove', buildHandleGlobalMouseMove());
}()
