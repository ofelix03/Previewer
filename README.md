# Previewer
A simplified [jQuery](http:/www.jquery.com "jQuery library") based library that previews individual images or image galleries with awesome easy to use features like, *keyboard navigations*, *pagination*, *autoplay*, *fullscreen preview* among many other minimalism oriented features, intended to keep  your application simple but still classic in appeal.

Check out the DEMO by downloading the plugin. A demo is packed with the download. Make sure to read the NOTE file inside the demo folder.

## Installation
1. **Using Bower**

	You can use the [Bower](https://bower.io/ "bower.io") asset manager to install this library.

	#### STEPS
	1. First, if you don't have [Bower](https://bower.io/ "Bower.io"), install it using NPM which comes with the [Node.js](https://nodejs.org "Node.js") installer. Check out the [Node.js site](https://nodejs.org "Node.js") for more information on how to install it. Having installed Node, open your [bash terminal](https://www.git-scm.com/downloads "Git-scm bash terminal") and run:
		`npm install --global bower-cli`

	2. `cd` into the root directory of your project and install bower locally in your project directory like so:
		``` npm install --save bower ```

	**NB**: Note, before you proceed, you can run `bower -v` to verify the install of bower. If you see a semantic version like `1.7.9`, you have bower already installed, else check the [Bower](https://bower.io/ "Bower.io") site for instructions on how to install it.

	2. With Bower installed, `cd` into the root directory of your project AND run this command.
		` bower install --save images-previewer `

2. **GitHub**

	Alternatively, you can `git clone https://github.com/ofelix03/previewer` to clone the GitHub repository for this plugin into your current project and use the files in the `dist` or `src` folder -- using the former for production and the latter for development.


## Usage

1. Load `previewer.js`(or `previewer.min.js`) and `previewer.css` (or `previewer.min.js`) into your html file like `index.html`.
**NB**: Make sure to load the `previewer.js` or `previewer.min.js` before  the `<\body>` of your document.

2. Create your html markup making sure all images that need to be previewable by the library have the class name `g-image`. Example is like so:
	
	```html
		<div class="gallery-wrapper">
       		<img src="..." alt="..." class="g-image">
       		<img src="..." alt="..." class="g-image">
       		<img src="..." alt="..." class="g-image">
       		...
	    </div>
	```

**NB**: Make sure to surround your images with a parent block element like a `<div>`, with an **ID** or **CLASSNAME** which can be use during the plugin's initialization which is discused later.

In my example above I used a class name `gallery-wrapper` on my surrounding block container. This container gives me a gallery, and so I can have many of galleries with their own set of images. Also make sure all your images have a class name `g-image` attached to them.

3. Now that you have built your gallery markup (your previewable images) , you can now initialize it like so:
	```javascript
		/** 1. Using jQuery **/
		$('.gallery-wrapper').previewer({autoPlay: true, slideTimeout: 2000});

		/**  OR 2. Using the Previewer atttached to javascript window object **/
		var previewer = new window.Previewer('.gallery-wrapper', {autoPlay: true, slideTimeout: 2000});
	``` 


## Options


|  Key                 | Value                 | Description             |
| ------------------------|:----------------------:|:-----------------------:|
| fullScreen    	      | boolean (*default*: false)| Centers image with some  padding by default or  images are previewer in full window's screen on value true| 
| pagination | boolean (**def**: true) | Adds a simple pagination to the previewer |
| paginationType | string [number, bullet] (*default*: number) | Select one of two pagination types ( bullet or number ) |
| paginationPosition | string [topLeft, topRight, bottomLeft, bottomRight] (*default*: 'topRight') | Determines the position of the paginator in the previewer |
| navigation | boolean [true, false] | Adds a simple 'PREV' and 'NEXT' navigators to slide through images |
| navNextText | string | Customize the label of the previewer's NEXT navigator. You can use any font icon library, like FontAwesome's right arrow icon like so:  `<i class="fa fa-arrow-right"></i>` |
| navPrevText | string | Customize the label of the previewer's PREV navigator. You can use any font icon library, like FontAwesome's left arrow icon like so: `<i class="fa fa-arrow-left"></i>` |
| keyboardNavigation | bool [true, false] | Allows the use of the keyboards, left and right arrow keys to control the navigation through image gallery |
| autoPlay | boolean [true, false] | Autoplays the images in the previewer |
| slideTimeout | integer (*default*: 1000) | Determines how long each image in the gallery should be previewed. Value of slideTimeout should be in *milliseconds. Example: 2000 for 2s slide timeout |
| previewEffect | string (*defaut*: 'linear') | This plugin has a number of CSS based transitions, which determines the effect with which the previewer shows up when an image is clicked. All the supported transitions will be found as you go through the reamining docs |


## Preview Effects

The following are currently the supported preview effects. These effects are all [CSS3 transition](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions).

1. easeIn
2. easeOut
3. easeInOut
4. outCubic
5. inBack
6. inOutBack



## Contributing

You can help improve this docs by sending me a pull request and hopefully I will merge it in. 
Also, you spotted an error (syntax or logic error) ? I will be glad to recieve a pull request of a fix of that 
error. But I would love it if you first open an issue and hopefully if it's not already in the pipes of resolution
by me or someone else, I will gladly assign it to you.
