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
  let cImgX = 0;
  let cImgY = 0;

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
  
  document.querySelector('#upload-btn').addEventListener('click', () => {
    inputUpload.click();
  });

  // 监听文件上传，缩放重置
  const originChange = new Event('originChange');
  document.addEventListener('originChange', () => {
    zoomSize.height = originImgH;
    zoomSize.width = originImgW;
  });

  /**
   * file 操作 
   */
  const getObjectUrl = (file) => {
    const url = URL.createObjectURL(file);
    return url;
  }

  inputUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    imageUrl = getObjectUrl(file);
    
    imgSrc.src = imageUrl;
    imgSrc.height = cHeight;
    imgSrc.width = cWidth;

    imgSrc.onload = () => {
      if (imgSrc) {
        context.clearRect(cImgX, cImgY, originImgW, originImgH)
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      cImgX = 0;
      cImgY = 0;

      originImgW = imgSrc.naturalWidth;
      originImgH = imgSrc.naturalHeight;
      document.dispatchEvent(originChange);
      context.drawImage(imgSrc, cImgX, cImgY, originImgW, originImgH);
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
    
    context.clearRect(cImgX, cImgY, zoomSize.width, zoomSize.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    cImgX += movementX;
    cImgY += movementY;

    context.drawImage(imgSrc, cImgX, cImgY, zoomSize.width, zoomSize.height);
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
            const preWidth = zoomSize.width;
            const preHeight = zoomSize.height;
  
            context.clearRect(cImgX, cImgY, preWidth, preHeight);
            context.clearRect(0, 0, canvas.width, canvas.height);

            zoomSize.height = sign * zoomSize.height;
            zoomSize.width = sign * zoomSize.width;
  
            cImgX += (preWidth - zoomSize.width)/2;
            cImgY += (preHeight - zoomSize.height)/2;
            
            context.drawImage(imgSrc, cImgX, cImgY, zoomSize.width, zoomSize.height);
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
  }

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

  // 保存

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

  const preview = document.querySelector('#preview');
  const previewCtx = preview.getContext('2d');
  
  const saveBtn = document.querySelector('#save-btn');
  
  document.querySelector('#clip-btn').addEventListener('click', () => {
    if (imageUrl) {
      const styleClip = window.getComputedStyle(rectClip, null);
      const top = parseFloat(styleClip.top);
      const left = parseFloat(styleClip.left);
      const width =parseFloat(styleClip.width);
      const height =parseFloat(styleClip.height);
      
      preview.width = width;
      preview.height = height;
  
      const img = new Image();
      img.src = canvas.toDataURL();
      
      img.onload = () => {
        previewCtx.drawImage(img, left, top, width, height, 0, 0, width, height);
        saveBtn.removeAttribute('disabled');
        saveBtn.classList.remove('btn-disabled');
      }    
    } else {
      alert('请上传图片进行截图！');
    }
  });

  saveBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = preview.toDataURL();
    a.download = `cut_${Date.now()}`;

    a.click();
  });
}()
