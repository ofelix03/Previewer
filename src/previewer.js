
var Previewer = (function($){

    const CLASS_NAMES = {
        // Previewer
        PREVIEWER_WRAPPER: 'g-previewer-wrapper',
        PREVIEWER_WRAPPER_SHOW: 'g-previewer-wrapper--show',
        IMAGE_PREVIEWER: 'g-image-previewer',
        IMAGE_PREVIEWER_FULLSCREEN: 'g-image-previewer--full-screen',
        IMAGE_PREVIEWER_CENTERED: 'g-image-previewer--centered',
        PREVIEW_IMAGE: 'g-image-previewer__image',
        IMAGE: 'g-image',
        PREVIEWER_CLOSE: 'g-previewer-close',

        // Nav
        PREVIEW_NAV: 'g-nav',
        PREVIEW_NAV_SHOW: 'g-nav--show',
        PREVIEW_NAV_PREV: 'g-nav--prev',
        PREVIEW_NAV_NEXT: 'g-nav--next',

        // Pagination
        PAGINATOR_WRAPPER: 'g-paginator-wrapper',
        PAGINATOR_WRAPPER_TOP_RIGHT: 'g-paginator-wrapper--top-right',
        PAGINATOR_WRAPPER_TOP_LEFT: 'g-paginator-wrapper--top-left',
        PAGINATOR_WRAPPER_BOTTOM_RIGHT: 'g-paginator-wrapper--bottom-right',
        PAGINATOR_WRAPPER_BOTTOM_LEFT: 'g-paginator-wrapper--bottom-left',
        PAGINATOR_WRAPPER_NUMBER: 'g-paginator-wrapper--number',
        PAGINATOR_BULLET: 'g-paginator__bullet',
        PAGINATOR_BULLET_ACTIVE: 'g-paginator__bullet--active',
        PAGINATOR_NUMBER_NUMERATOR: 'g-paginator__number--numerator',
        PAGINATOR_NUMBER_DENOMINATOR: 'g-paginator__number--denominator',

        // Transitions
        PREVIEWER_WRAPPER_EASE_IN: 'g-previewer-wrapper--ease-in',
        PREVIEWER_WRAPPER_EASE_OUT: 'g-previewer-wrapper--ease-out',
        PREVIEWER_WRAPPER_IN_BACK: 'g-previewer-wrapper--in-back',
        PREVIEWER_WRAPPER_IN_OUT_BACK: 'g-previewer-wrapper--in-out-back',
        PREVIEWER_WRAPPER_OUT_CUBIC: 'g-previewer-wrapper--out-cubic',
    };

    var instanceCounter = 0;

    return function Previewer(selector, options) {
        var g = this;

        // A simple counter which keeps track of the number of 
        // instances of the object created
        g.instanceCounter = ++instanceCounter;

        g.$container = $(selector);
        g.currentContainerIndex;
        g.$previewerWrapper;
        g.$imagePreviewer;
        g.$previewImage;
        g.$image;
        /** Array */
        g.$images = [];
        g.options;
        g.previewer = {
            currentImageIndex: 0,
        };
        g.pagination = {
            types: ['number', 'bullet'],
            positions: ['topRight', 'topLeft', 'bottomRight', 'bottomLeft'],
        };

        // Tells whether an image is previewed
        g.isPreviewed = false;

        g.transitions = {
            linear: 'linear',
            easeOut: 'easeOut',
            easeIn: 'easeIn',
            easeInOut: 'easeInOut',
            outCubic: 'outCubic',
            inOutBack: 'inOutBack',
            inBack: 'inBack',
        };

        var defaultOptions = {
            fullScreen: false,

            // Pagination
            pagination: true,
            paginationType: 'number', // Options: numbers, bullets
            paginationPosition: 'topRight', // Options: topRight, topLeft, bottomRight, bottomLeft

            // Navigation
            navigation: true,
            navPrevText: 'PREV',
            navNextText: 'NEXT',
            closeButtonText: 'X',

            keyboardNavigation: true,

            // Autoplay
            autoPlay: false,
            slideTimeout: 1000,

            // Transition
            previewEffect: g.transitions.linear,
        }

        g.options = $.extend({}, defaultOptions, options);

        init();

        //////////////////////////////////////
        ///  # Functions
        ////////////////////////////////////
        
        function init() {

            initPreviewer();

            // Let's look at the options
            if (g.options.fullScreen) {
                g.$imagePreviewer.addClass(CLASS_NAMES.IMAGE_PREVIEWER_FULLSCREEN);
            }

            // Let at listeners to all imags in all galleries 
            g.$container.each(function(index){
                var $container = $(this),
                containerIndex = g.currentContainerIndex = $container.data('index');
                g.$images[containerIndex].each(function(index){
                    $image = $(this);
                    $image.on('click', handleImageClicked);
                });
            });

            if (g.options.keyboardNavigation && g.options.navigation) {
                // Let allow the user to use the keyboard's left and right arrows keys to
                // slide through the gallery
                $(document).on('keyup', handleKeyboardNavigation);
            }

            $(document).on('keyup', function(event){
                const ESCAPE_KEY_CODE = 27;
                if (event.keyCode == ESCAPE_KEY_CODE) {
                    handlePreviewerClose();
                }
            });

            // Listen for preview close
            g.$previewerClose.on("click", handlePreviewerClose);

            if (g.options.navigation) {
                // Let listen for the prev nav click and handle it
                g.$previewNavPrev.click(handlePreviewNavPrev);

                // Let listen for the next nav click and handle it
                g.$previewNavNext.click(handlePreviewNavNext);
            }
        }

        function handlePreviewerClose() {
            g.$previewerWrapper.removeClass(CLASS_NAMES.PREVIEWER_WRAPPER_SHOW);
            g.isPreviewed = false;
        }

        function handleKeyboardNavigation(event) {
            const LEFT_ARROW_KEY = 37, RIGHT_ARROW_KEY = 39, SPACE_BAR = 32;

            if (g.isPreviewed && !g.options.autoPlay) {
                if (LEFT_ARROW_KEY == event.which) {
                    handlePreviewNavPrev();
                } else if (RIGHT_ARROW_KEY == event.which || SPACE_BAR == event.which) {
                    handlePreviewNavNext();
                }
            }
        }

        function handleImageClicked() {
            var $image = $(this);
            buildPreview($image);
            showPreviewer(getImageCenterPosition($image));
        }

        function handlePreviewNavNext() {
            if (g.previewer.currentImageIndex == g.$images[g.currentContainerIndex].length ) {
                var $image = $(g.$images[g.currentContainerIndex][0]);
                buildPreview($image);
                updatePaginator('next');
            } else {
                g.$images[g.currentContainerIndex].each(function(index){
                    $image = $(this);
                    if (($image.data('index') - g.previewer.currentImageIndex) == 1) {
                        found = true;
                        buildPreview($image);
                        updatePaginator('next');

                        return false;
                    }
                });
            }

        // Let check the options if use has allowed autoplay of images, 
        // if yes let init autoplay
        if (g.options.autoPlay && g.isPreviewed) {
            initAutoPlay();
        }
    }

    function handlePreviewNavPrev() {
        $this = $(this);

        if (g.previewer.currentImageIndex == 1) {
            var $image = g.$images[g.currentContainerIndex].last();
            buildPreview($image);
            updatePaginator('prev');
        } else {
            g.$images[g.currentContainerIndex].each(function(){
                $image = $(this);
                if (($image.data('index') - g.previewer.currentImageIndex) == -1) {
                    buildPreview($image);
                    updatePaginator('prev');
                    return false;
                }
            });
        }

        // Let check the options if use has allowed autoplay of images, 
        // if yes let init autoplay
        if (g.options.autoPlay && g.isPreviewed) {
            initAutoPlay();
        }
    }

    function initBulletClickListener() {
        var bullets = g.$previewerWrapper.find('.' + CLASS_NAMES.PAGINATOR_BULLET);
        bullets.each(function(){
            $(this).click(function(){
                var bullet  = $(this), bulletIndex = bullet.data('index');

                var $image = $(g.$images[g.currentContainerIndex][bulletIndex - 1]);

                buildPreview($image);
                showPreviewer();
                restartAutoPlay();
            });
        });
    }


    function buildPreview($image) {
        // Building the previewer, we're just assigning the image's url to
        // the g.$previewImage(<img>) src attribute
        // We then update the g.previewer.currentImageIndex and g.currentContainerIndex to
        // reflect the build
        g.$previewImage.attr('src', $image.attr('src'));
        g.previewer.currentImageIndex = $image.data('index');
        g.currentContainerIndex = $image.parent().data('index');
    }

    function initAutoPlay() {
        g.timeoutId  = setTimeout(function(){handlePreviewNavNext();}, g.options.slideTimeout);
    }

    function restartAutoPlay() {
        clearTimeout(g.timeoutId);
    }

    function initPreviewer() {
        // Let first , fetch, index and prepend our previewer wrapper html markup to the body of doc
        $(getPreviewerWrapperHtml()).data('index', g.instanceCounter).prependTo('body');

        // Let now look for our this instance specific $previewerWrapper, what we just prepended to the DOM
        $('.' + CLASS_NAMES.PREVIEWER_WRAPPER).each(function(){
            var $this = $(this);

            if ($this.data('index') == g.instanceCounter) {
                g.$previewerWrapper = $this;
                return false;
            }
        });

        g.$imagePreviewer = g.$previewerWrapper.find('.' + CLASS_NAMES.IMAGE_PREVIEWER);
        g.$previewImage = g.$previewerWrapper.find('.' + CLASS_NAMES.PREVIEW_IMAGE);
        g.$previewerClose = g.$previewerWrapper.find('.' + CLASS_NAMES.PREVIEWER_CLOSE).html(g.options.closeButtonText);

        // A previewer object instance can target more than one selector (that's galleries)
        // So let's check how many gallery containers are in the document, and find the 
        // number of images found in them. This allows use to create different previews 
        // for each set of images
        if (g.$container.length > 1) {
            g.$container.each(function(index){
                container = $(this);
                container.data('index', index);
                    // Let store all the images found each of the containers under an array index
                    g.$images[index] = container.find('.' + CLASS_NAMES.IMAGE); 
                });
        } else {
            // There is only one gallery for the selector
            g.$container.data('index', 0);
            g.$images[0] = g.$container.find('.' + CLASS_NAMES.IMAGE);
        }

        // Let append an index to the images, starting from 0, with all images
        // in each specific container.
        // This helps me with identify images
        var i = 0;
        for(; i < g.$container.length; i++) {
            g.$images[i].each(function(index){
                appendIndexToImage($(this), index);
            });
        }

        if (g.options.navigation) {
            g.$previewNav = g.$previewerWrapper.find('.' + CLASS_NAMES.PREVIEW_NAV).addClass(CLASS_NAMES.PREVIEW_NAV_SHOW);
            g.$previewNavPrev = g.$previewerWrapper.find('.' + CLASS_NAMES.PREVIEW_NAV_PREV).html(g.options.navPrevText);
            g.$previewNavNext = g.$previewerWrapper.find('.' + CLASS_NAMES.PREVIEW_NAV_NEXT).html(g.options.navNextText);                 
        }

        if (g.options.pagination) {
            var index = g.pagination.types.indexOf(g.options.paginationType);
            if (index == -1) {
                // No options specified by user, or option not in available types, let stick wth the 
                // default type
                g.$previewerWrapper.append($(getPaginationHtml()).addClass(CLASS_NAMES.PAGINATOR_WRAPPER_NUMBER));
            } else {
                g.$previewerWrapper.append(getPaginationHtml(g.pagination.types[index]));
                if (g.options.paginationType == 'number') {
                    // Let add a little specific styling to the number pagination markup 
                    g.$previewerWrapper.find('.' + CLASS_NAMES.PAGINATOR_WRAPPER).addClass(CLASS_NAMES.PAGINATOR_WRAPPER_NUMBER);
                }
            }

            var paginatorWrapper = g.$previewerWrapper.find('.' + CLASS_NAMES.PAGINATOR_WRAPPER);
            if (paginationPositionExists(g.options.paginationPosition)) {
                var pos = getPaginationPosition();

                if (pos == 'topRight') {
                    paginatorWrapper.addClass(CLASS_NAMES.PAGINATOR_WRAPPER_TOP_RIGHT)
                } else if (pos == 'topLeft') {
                    paginatorWrapper.addClass(CLASS_NAMES.PAGINATOR_WRAPPER_TOP_LEFT);
                } else if (pos == 'bottomRight') {
                    paginatorWrapper.addClass(CLASS_NAMES.PAGINATOR_WRAPPER_BOTTOM_RIGHT);
                } else if (pos == 'bottomLeft') {
                    paginatorWrapper.addClass(CLASS_NAMES.PAGINATOR_WRAPPER_BOTTOM_LEFT);
                }
            } else {
                // Let resort to default position
                paginatorWrapper.addClass(CLASS_NAMES.PAGINATOR_WRAPPER_BOTTOM_RIGHT);
            }
        } 
    }

    function paginationPositionExists(position) {
        if (g.pagination.positions.indexOf(g.options.paginationPosition) > -1) {
            return true;
        }

        return false;
    }

    function getPaginationPosition() {
        var index = g.pagination.positions.indexOf(g.options.paginationPosition);

        return g.pagination.positions[index];
    }

    function showPreviewer(position) {
        if (position !== undefined) {
            g.$previewerWrapper.css({left: position.left, top: position.top});
        }

        if (g.options.pagination) {
            if (g.options.paginationType == 'bullet') {
                createBulletPaginator(); 
            } else if (g.options.paginationType == 'number' || g.options.paginationType === undefined) {
                createNumberPaginator();
            }
        }

        g.isPreviewed = true;

        if (g.options.pagination) {
            initBulletClickListener();        
        }

        // Let check the options if use has allowed autoplay of images, 
        // if yes let init autoplay
        if (g.options.autoPlay && g.isPreviewed) {
            initAutoPlay();
        }

        // Now let just show the previewer
        setTimeout(function(){
            if (g.options.previewEffect !== g.transitions.linear) {
                var transitionClassName = getTransitionClassFor();
                g.$previewerWrapper.addClass(CLASS_NAMES.PREVIEWER_WRAPPER_SHOW).addClass(transitionClassName);
            } else {
                // Let use default transition, which is linear
                g.$previewerWrapper.addClass(CLASS_NAMES.PREVIEWER_WRAPPER_SHOW);
            }
        }, 400);
    }


    function getTransitionClassFor() {
        // Let first make sure the first letter of the previewEffect from user is lowercase.
        g.options.previewEffect = g.options.previewEffect[0].toLowerCase() + g.options.previewEffect.substr(1);

        if (g.options.previewEffect == g.transitions.easeIn) {
            return CLASS_NAMES.PREVIEWER_WRAPPER_EASE_IN;
        } else if (g.options.previewEffect == g.transitions.easeOut) {
            return CLASS_NAMES.PREVIEWER_WRAPPER_EASE_OUT;
        } else if (g.options.previewEffect == g.transitions.easeInOut) {
            return CLASS_NAMES.PREVIEWER_WRAPPER_EASE_IN_OUT;
        } else if (g.options.previewEffect == g.transitions.inOutBack) {
            return CLASS_NAMES.PREVIEWER_WRAPPER_IN_OUT_BACK;
        } else if (g.options.previewEffect == g.transitions.outCubic) {
            return CLASS_NAMES.PREVIEWER_WRAPPER_OUT_CUBIC;
        } else if (g.options.previewEffect == g.transitions.inBack) {
            return CLASS_NAMES.PREVIEWER_WRAPPER_IN_BACK;
        }
    }

    function getImageCenterPosition(image) {
        var leftPos, topPos, imageOffset = image.offset();

        leftPos = imageOffset.left  +  Math.ceil(image.innerWidth() / 2);
        topPos = (imageOffset.top - $(window).scrollTop()) + Math.ceil(image.innerHeight() / 2);

        return {left: leftPos, top: topPos};
    }

    function appendIndexToImage(image, index) {
        return image.data('index', index + 1);
    }

    function createBulletPaginator() {
        var bulletElement = $(getPaginationBulletElement());
        var paginatorWrapper = g.$previewerWrapper.find('.' + CLASS_NAMES.PAGINATOR_WRAPPER);
         // Let .html() to clear any existing bullet element in paginatorWrapper
         paginatorWrapper.html('');
         var i = 0;
         for (; i < g.$images[g.currentContainerIndex].length; i++) {
            if (g.previewer.currentImageIndex == (i + 1)) {
                bulletElement.clone().data('index', i + 1).addClass(CLASS_NAMES.PAGINATOR_BULLET_ACTIVE).appendTo(paginatorWrapper);
            } else {
                bulletElement.clone().data('index', i + 1).appendTo(paginatorWrapper);
            }
        }
    }

    function createNumberPaginator() {
        g.$previewerWrapper.find('.' + CLASS_NAMES.PAGINATOR_NUMBER_NUMERATOR).text(g.previewer.currentImageIndex);
        g.$previewerWrapper.find('.' + CLASS_NAMES.PAGINATOR_NUMBER_DENOMINATOR).text(g.$images[g.currentContainerIndex].length);
    }

    function updatePaginator(action) {
        if (g.options.pagination) {
            if (g.options.paginationType == 'number' || g.options.paginationType === undefined) {
                updateNumberPaginator(action);
            } else if (g.options.paginationType == 'bullet') {
                updateBulletPaginator(action);
            }
        }

        function updateNumberPaginator(action) {
            g.$previewerWrapper.find('.' + CLASS_NAMES.PAGINATOR_NUMBER_NUMERATOR).text(g.previewer.currentImageIndex);
        }

        function updateBulletPaginator(action) {
            // action can be [prev|next];
            var bullets = g.$previewerWrapper.find('.' + CLASS_NAMES.PAGINATOR_WRAPPER).find('.' + CLASS_NAMES.PAGINATOR_BULLET);
            if (action === undefined) {
                throw "upateBulletPaginator() requires an action parameter of value 'next' or 'prev', none given";
            } else if (action == 'prev') {
                bullets.each(function(){
                    var $this = $(this), index = $this.data('index');
                    // Let look for the bullet with an index matching the index of the current image
                    if (index == g.previewer.currentImageIndex) {
                        $this.addClass(CLASS_NAMES.PAGINATOR_BULLET_ACTIVE);
                        return false;
                    } 
                });

                // Let look for bullet with an index matching the previously current image's index
                bullets.each(function(){
                    var $this = $(this), index = $this.data('index');

                    if (index == g.previewer.currentImageIndex + 1 
                        || ((g.previewer.currentImageIndex == g.$images[g.currentContainerIndex].length) && index == 1)) {
                        $this.removeClass(CLASS_NAMES.PAGINATOR_BULLET_ACTIVE);
                    return false;
                }
            });
            } else if (action == 'next') {
                // Let look for the bullet with an index matching the index of the current image
                bullets.each(function(){
                    var $this = $(this), index = $this.data('index');

                    if (index == g.previewer.currentImageIndex) {
                        $this.addClass(CLASS_NAMES.PAGINATOR_BULLET_ACTIVE);
                        return false;
                    }    
                });

                // Let remove the active state from the bullet right behind the current active bullet
                bullets.each(function(){
                    var $this = $(this), index = $this.data('index');

                    if (index == g.previewer.currentImageIndex - 1
                        || (index == g.$images[g.currentContainerIndex].length && (g.previewer.currentImageIndex == 1))
                        ) {
                        $this.removeClass(CLASS_NAMES.PAGINATOR_BULLET_ACTIVE);
                    return false;
                }
            });
            }
        }
    }

    function getPreviewerWrapperHtml() {
        return '<div class="g-previewer-wrapper">' + 
        '<div class="g-previewer-close"></div>' +
        '<div class="g-image-previewer">' +
        '<img src="" alt="" class="g-image-previewer__image">' +
        '</div>' +
        '<div class="g-nav g-nav--prev">Prev</div>' +
        '<div class="g-nav g-nav--next">Next</div>'  +   
        '</div>';
    }

    function getPaginationHtml(paginationType) {
        var bulletPagination = '<div class="g-paginator-wrapper"><!-- In here will be bullet elements from getPaginationBulletElement() --></div>';

        var numberPagination = '<div class="g-paginator-wrapper">' + 
        '<span class="g-paginator__number g-paginator__number--numerator">5</span>' + 
        '<span class="g-paginator__number g-paginator__number--denominator">10</span>' + 
        '</div>';

        if (paginationType === undefined || paginationType == 'number') {
            return numberPagination;
        } else {
            return bulletPagination;
        }
    }

    function getPaginationBulletElement() {
        return '<span class="g-paginator__bullet"></span>';
    }
}
})(jQuery);

(function($, window, Previewer){

    // Attaching to jQuery as a plugin
    if ($ !== undefined) {
        $.fn.previewer = function(options){
            return new Previewer(this, options);
        }
    }

    // Attaching it to the global Object
    if (window !== undefined) {
        window.Previewer = Previewer;
    }

})(jQuery, window, Previewer);

