import funcs from "./funcs";
import effects from "./effects";
import pagination from "./pagination";
import classes from "./classes";

let instanceCount = 0;

export class Previewer {
  constructor(selector, options) {
    if (funcs.isString(selector)) {
      this.selector = document.querySelector(selector);
    } else if (selector.nodeType === Node.ELEMENT_NODE) {
      this.selector = selector;
    }

    this.widnowScrollTop;

    this.defaultOptions = {
      fullScreen: false,

      // Pagination
      pagination: true,
      paginationType: "number", // Options: numbers, bullets
      paginationPosition: "topRight", // Options: topRight, topLeft, bottomRight, bottomLeft

      // Navigation
      navigation: true,
      navPrevText: "PREV",
      navNextText: "NEXT",
      closeButtonText: "X",

      keyboardNavigation: true,

      // Autoplay
      autoPlay: false,
      slideTimeout: 1000,

      // Transition
      previewEffect: effects.linear,
    };

    this.options = Object.assign({}, this.defaultOptions, options);

    this.instanceCount = instanceCount += 1;
    this.currentContainerIndex;
    this.currentPreviewImageIndex = 0;
    this.previewerWrapper;
    this.imagePreviewer;
    this.previewImage;
    this.image;
    this.images;
    this.previewerClose;
    this.currentPrevewImagePosition;

    this.previewNav;
    this.previewNavPrev;
    this.previewNavNext;
    this.isPreviewed = false;

    this.paginationWrapper;

    this.autoPlayTimeoutId;

    this.init();
  }

  init() {
    this.images = this.selector.querySelectorAll(`.${classes.IMAGE}`);

    this._bindIndexToImages();

    this.previewerWrapper = document.querySelector(
      `.${classes.PREVIEWER_WRAPPER}`
    );

    if (!this.previewerWrapper) {
      this.previewerWrapper = document.createElement("div");
      this.previewerWrapper.setAttribute("index", this.instanceCount);
      this.previewerWrapper.classList.add(classes.PREVIEWER_WRAPPER);
      this.previewerWrapper.innerHTML = this.getPreviewerWrapperMarkup();

      document.body.append(this.previewerWrapper);
    }

    this.imagePreviewer = this.previewerWrapper.querySelector(
      `.${classes.IMAGE_PREVIEWER}`
    );

    this.previewImage = this.previewerWrapper.querySelector(
      `.${classes.PREVIEW_IMAGE}`
    );

    this.previewerClose = this.previewerWrapper.querySelector(
      `.${classes.PREVIEWER_CLOSE}`
    );

    this.previewerClose.innerHTML = this.options.closeButtonText;

    if (this.options.navigation) {
      this.previewNav = this.previewerWrapper.querySelector(
        `.${classes.PREVIEW_NAV}`
      );
      this.previewNavPrev = this.previewerWrapper.querySelector(
        `.${classes.PREVIEW_NAV_PREV}`
      );
      this.previewNavNext = this.previewerWrapper.querySelector(
        `.${classes.PREVIEW_NAV_NEXT}`
      );

      this.previewNavPrev.innerHTML = this.options.navPrevText;
      this.previewNavNext.innerHTML = this.options.navNextText;

      this.previewNavPrev.classList.add(classes.PREVIEW_NAV_SHOW);
      this.previewNavNext.classList.add(classes.PREVIEW_NAV_SHOW);
    }

    if (this.options.pagination) {
      if (this.options.paginationType == pagination.types.Number) {
        this.paginationWrapper = this.previewerWrapper.querySelector(
          `.${classes.PAGINATOR_WRAPPER_NUMBER}`
        );
      } else if (this.options.paginationType == pagination.types.Bullet) {
        this.paginationWrapper = this.previewerWrapper.querySelector(
          `.${classes.PAGINATOR_WRAPPER_BULLET}`
        );
      } else {
        this.paginationWrapper = this.previewerWrapper.querySelector(
          `.${classes.PAGINATOR_WRAPPER_NUMBER}`
        );
      }
      this.paginationWrapper.classList.add(classes.PAGINATOR_WRAPPER_SHOW);
    }

    this._initListenerForImageClick();
  }

  _bindIndexToImages() {
    let imageIndex = 0;
    for (let image of this.images) {
      image.setAttribute("index", imageIndex);
      imageIndex++;
    }
  }

  _initListenerForImageClick() {
    for (let image of this.images) {
      image.addEventListener("click", (event) => {
        this.onImageClicked(event);
        return false;
      });
    }
  }

  _initListenerForNavButtons() {
    this.previewNavNext.addEventListener("click", (event) => {
      this.showNextImage();
      return false;
    });
    this.previewNavPrev.addEventListener("click", (event) => {
      this.showPreviousImage();
      return false;
    });
  }

  _initListenerForKeyboardEvents() {
    if (this.options.keyboardNavigation && this.options.navigation) {
      document.addEventListener("keyup", (event) => {
        this.handleKeyboardNavigation(event);
        return false;
      });
    }

    document.addEventListener("keyup", (event) => {
      const ESCAPE_KEY = 27;
      if (event.keyCode == ESCAPE_KEY) {
        this.hidePreviewer();
      }
      return false;
    });

    this.previewerClose.addEventListener("click", (event) => {
      this.hidePreviewer();
      return false;
    });
  }

  onImageClicked(event) {
    const image = event.target;
    this.updatePreview(image);
    this.showPreviewer();
  }

  computeCurrentPreviewImagePosition(image) {
    const imageDim = image.getBoundingClientRect();

    const leftPos = imageDim.left + Math.ceil(imageDim.width / 2);
    const topPos = imageDim.top + Math.ceil(imageDim.height / 2);

    this.previewerWrapper.setAttribute(
      "style",
      `left: ${leftPos}px; top: ${topPos}px`
    );
  }

  updatePreview(image) {
    if (image !== undefined) {
      this.previewImage.src = image.getAttribute("src");
      this.currentPreviewImageIndex = parseInt(image.getAttribute("index"));
      this.computeCurrentPreviewImagePosition(image);
    }
  }

  showPreviewer() {
    this._initListenerForKeyboardEvents();
    this._initListenerForNavButtons();

    this.imagePreviewer.addEventListener("click", (event) => {
      this.hidePreviewer();
      return false;
    });

    if (this.options.pagination) {
      if (this.options.paginationType == pagination.types.Bullet) {
        this._buildBulletPagination();
      } else if (this.options.paginationType == pagination.types.Number) {
        this._buildNumberPagination();
      }
      this._initBulletPaginationClickLister();
      this._positionPagination();
    }

    // Time to show previewer
    setTimeout(() => {
      if (this.options.previewEffect == effects.linear) {
        this.previewerWrapper.classList.add(classes.PREVIEWER_WRAPPER_SHOW);
      } else {
        const transitionClass = this._getTransitionClassFor(
          this.options.previewEffect
        );
        if (transitionClass) {
          this.previewerWrapper.classList.add(transitionClass);
          this.previewerWrapper.classList.add(classes.PREVIEWER_WRAPPER_SHOW);
        }
      }
      this.isPreviewed = true;
      // Check for autoplay
      if (this.options.autoPlay) {
        this._initAutoPlay();
      }

      document.querySelector("body").classList.add(classes.DOCUMENT_FIXED);
    }, 400);
  }

  _positionPagination() {
    if (this.options.paginationPosition) {
      const pos = this.options.paginationPosition;
      if (pos == pagination.positions.topRight) {
        this.paginationWrapper.classList.add(
          classes.PAGINATOR_WRAPPER_TOP_RIGHT
        );
      } else if (pos == pagination.positions.topLeft) {
        this.paginationWrapper.classList.add(
          classes.PAGINATOR_WRAPPER_TOP_LEFT
        );
      } else if (pos == pagination.positions.bottomRight) {
        this.paginationWrapper.classList.add(
          classes.PAGINATOR_WRAPPER_BOTTOM_RIGHT
        );
      } else if (pos == pagination.positions.bottomLeft) {
        this.paginationWrapper.classList.add(
          classes.PAGINATOR_WRAPPER_BOTTOM_LEFT
        );
      }
    } else {
      this.paginationWrapper.classList.add(
        classes.PAGINATOR_WRAPPER_BOTTOM_RIGHT
      );
    }
  }

  hidePreviewer() {
    this.previewerWrapper.classList.remove(classes.PREVIEWER_WRAPPER_SHOW);
    document.querySelector("body").classList.remove(classes.DOCUMENT_FIXED);

    this.isPreviewed = false;

    if (this.options.autoPlay) {
      this._restartAutoPlay();
    }
  }

  _getTransitionClassFor() {
    // Let first make sure the first letter of the previewEffect from user is lowercase.
    this.options.previewEffect =
      this.options.previewEffect[0].toLowerCase() +
      this.options.previewEffect.substr(1);

    if (this.options.previewEffect == effects.easeIn) {
      return classes.PREVIEWER_WRAPPER_EASE_IN;
    } else if (this.options.previewEffect == effects.easeOut) {
      return classes.PREVIEWER_WRAPPER_EASE_OUT;
    } else if (this.options.previewEffect == effects.easeInOut) {
      return classes.PREVIEWER_WRAPPER_EASE_IN_OUT;
    } else if (this.options.previewEffect == effects.inOutBack) {
      return classes.PREVIEWER_WRAPPER_IN_OUT_BACK;
    } else if (this.options.previewEffect == effects.outCubic) {
      return classes.PREVIEWER_WRAPPER_OUT_CUBIC;
    } else if (this.options.previewEffect == effects.inBack) {
      return classes.PREVIEWER_WRAPPER_IN_BACK;
    }
  }

  _initAutoPlay() {
    this.autoPlayTimeoutId = setInterval(() => {
      this.showNextImage();
    }, this.options.slideTimeout);
  }

  _restartAutoPlay() {
    clearTimeout(this.autoPlayTimeoutId);
  }

  getPreviewerWrapperMarkup() {
    return `
            <div class="g-previewer-close"></div>

            <div class="g-image-previewer">
                <img src="" alt="" class="g-image-previewer__image">
            </div>

            <!-- Navigation -->
            <div class="g-nav g-nav--prev">Prev</div>
            <div class="g-nav g-nav--next">Next</div>  

            <!-- Pagination -->
            <div class="g-paginator-wrapper g-paginator-wrapper--bullet">
              <!-- bullets here -->
            </div>
            <div class="g-paginator-wrapper g-paginator-wrapper--number"> 
                <span class="g-paginator__number g-paginator__number--numerator">5</span>
                <span class="g-paginator__number g-paginator__number--denominator">10</span>
            </div>  
    `;
  }

  _getPaginationBulletMarkup() {
    return '<span class="g-paginator__bullet"></span>';
  }

  _buildBulletPagination() {
    let bulletsMarkup = "",
      bulletIndex = 0,
      images_len = this.images.length;

    for (let i = 0; i < images_len; i++) {
      bulletsMarkup += this._getPaginationBulletMarkup();
    }
    this.paginationWrapper.innerHTML = bulletsMarkup;

    const bullets = this.paginationWrapper.querySelectorAll(
      `.${classes.PAGINATOR_BULLET}`
    );

    // Associate index data-attr to image
    for (let bullet of bullets) {
      bullet.setAttribute("index", bulletIndex);
      if (bulletIndex == this.currentPreviewImageIndex) {
        bullet.classList.add(classes.PAGINATOR_BULLET_ACTIVE);
      }
      bulletIndex++;
    }
  }

  _buildNumberPagination() {
    const numeratorPage = this.paginationWrapper.querySelector(
      `.${classes.PAGINATOR_NUMBER_NUMERATOR}`
    );
    const denominatorPage = this.paginationWrapper.querySelector(
      `.${classes.PAGINATOR_NUMBER_DENOMINATOR}`
    );

    numeratorPage.innerHTML = this.currentPreviewImageIndex + 1;
    denominatorPage.innerHTML = this.images.length;
  }

  _initBulletPaginationClickLister() {
    const bullets = this.paginationWrapper.querySelectorAll(
      `.${classes.PAGINATOR_BULLET}`
    );
    for (let bullet of bullets) {
      bullet.addEventListener("click", (event) =>
        this._onBulletClickedHandler(event)
      );
    }
  }

  _onBulletClickedHandler(event) {
    const bulletIndex = event.target.getAttribute("index");
    const image = this.images[bulletIndex];
    this.updatePreview(image);
    this.updatePaginator();
    this._restartAutoPlay();
  }

  updatePaginator() {
    if (this.options.pagination) {
      const type = this.options.paginationType;
      if (type == pagination.types.Number) {
        this.updateNumberPaginator();
      } else if (type == pagination.types.Bullet) {
        this.updateBulletPaginator();
      }
    } else {
      this.updateNumberPaginator();
    }
  }

  updateNumberPaginator() {
    this.paginationWrapper.querySelector(
      `.${classes.PAGINATOR_NUMBER_NUMERATOR}`
    ).innerHTML = this.currentPreviewImageIndex + 1;
    this.paginationWrapper.querySelector(
      `.${classes.PAGINATOR_NUMBER_DENOMINATOR}`
    ).innerHTML = this.images.length;
  }

  updateBulletPaginator() {
    const bullets = this.paginationWrapper.querySelectorAll(
      `.${classes.PAGINATOR_BULLET}`
    );
    for (let bullet of bullets) {
      const index = bullet.getAttribute("index");
      if (index == this.currentPreviewImageIndex) {
        bullet.classList.add(classes.PAGINATOR_BULLET_ACTIVE);
      } else {
        bullet.classList.remove(classes.PAGINATOR_BULLET_ACTIVE);
      }
    }
  }

  handlePreviewerClose() {
    this.previewerWrapper.classList.remove(classes.PREVIEWER_WRAPPER_SHOW);
    this.isPreviewed = false;
  }

  handleKeyboardNavigation(event) {
    const LEFT_ARROW_KEY = 37,
      RIGHT_ARROW_KEY = 39,
      SPACE_BAR = 32;

    if (this.isPreviewed && !this.options.autoPlay) {
      if (LEFT_ARROW_KEY == event.which) {
        this.showPreviousImage();
      } else if (RIGHT_ARROW_KEY == event.which || SPACE_BAR == event.which) {
        this.showNextImage();
      }
    }
  }

  showPreviousImage() {
    let image, imagePos;
    imagePos =
      this.currentPreviewImageIndex == 0
        ? this.images.length - 1
        : this.currentPreviewImageIndex - 1;

    image = this.images[imagePos];

    this.updatePreview(image);
    this.updatePaginator();
  }

  showNextImage() {
    let image, imagePos;
    imagePos =
      this.currentPreviewImageIndex == this.images.length - 1
        ? 0
        : this.currentPreviewImageIndex + 1;
    image = this.images[imagePos];

    this.updatePreview(image);
    this.updatePaginator();
  }
}
