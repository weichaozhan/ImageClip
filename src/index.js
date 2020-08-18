!function(){
  const mouseCoordinate = {
    x: 0,
    y: 0,
  };
  // const inputUpload = document.querySelector('#upload');
  const canvasWrapper = document.querySelector('#canvas-wrapper');
  const canvas = document.querySelector('#canvas');
  const cHeight = canvas.clientHeight;
  const cWidth = canvas.clientWidth;
  const context = canvas.getContext('2d');
  let cImgX = 0;
  let cImgY = 0;

  let imgSrc = new Image();
  let originImgW;
  let originImgH;
  let zoomSize = {
    height: 0,
    width: 0,
  };

  let imageUrl;

  // document.querySelector('#upload-btn').addEventListener('click', () => {
  //   inputUpload.click();
  // })

  const originChange = new Event('originChange');
  document.addEventListener('originChange', () => {
    zoomSize.height = originImgH;
    zoomSize.width = originImgW;
  });

  /**
   * file 操作 
   */
  // const getObjectUrl = (file) => {
  //   const url = URL.createObjectURL(file);
  //   return url;
  // }

  // inputUpload.addEventListener('change', (e) => {
  //   const file = e.target.files[0];
  //   imageUrl = getObjectUrl(file);
    
  //   imgSrc.src = imageUrl;
  //   imgSrc.height = cHeight;
  //   imgSrc.width = cWidth;

  //   imgSrc.onload = () => {
  //     imgSrc && (context.clearRect(cImgX, cImgY, originImgW, originImgH));

  //     cImgX = 0;
  //     cImgY = 0;

  //     originImgW = imgSrc.naturalWidth;
  //     originImgH = imgSrc.naturalHeight;
  //     document.dispatchEvent(originChange);
  //     context.drawImage(imgSrc, cImgX, cImgY, originImgW, originImgH);
  //   };
  // });

  imageUrl = './test.jpg';
    
  imgSrc.src = imageUrl;
  imgSrc.height = cHeight;
  imgSrc.width = cWidth;

  imgSrc.onload = () => {
    imgSrc && (context.clearRect(cImgX, cImgY, originImgW, originImgH));

    cImgX = 0;
    cImgY = 0;

    originImgW = imgSrc.naturalWidth;
    originImgH = imgSrc.naturalHeight;
    document.dispatchEvent(originChange);
    context.drawImage(imgSrc, cImgX, cImgY, originImgW, originImgH);
  };

  /**
   * canvas 操作
   */
  let mouseDown = false;
  const buildHandleMouseMove = () => {
    let flag = null;

    return (e) => {
      if (!flag && imageUrl && mouseDown) {
        flag = setTimeout(() => {
          let movementX = e.screenX - mouseCoordinate.x;
          let movementY = e.screenY - mouseCoordinate.y;

          mouseCoordinate.x = e.screenX;
          mouseCoordinate.y = e.screenY;
          
          context.clearRect(cImgX, cImgY, zoomSize.width, zoomSize.height);
          
          cImgX += movementX;
          cImgY += movementY;

          context.drawImage(imgSrc, cImgX, cImgY, zoomSize.width, zoomSize.height);
          flag = null;
        }, 60);
      }
    }
  }

  document.addEventListener('mouseup', () => {
    mouseDown = false;
  });
  canvasWrapper.addEventListener('mousemove', buildHandleMouseMove());
  canvasWrapper.addEventListener('mousedown', (e) => {
    mouseDown = true;
    mouseCoordinate.x = e.screenX;
    mouseCoordinate.y = e.screenY;
  });
  canvasWrapper.addEventListener('mouseup', () => {
    mouseDown = false;
  });
  // 滚轮事件
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
}()
