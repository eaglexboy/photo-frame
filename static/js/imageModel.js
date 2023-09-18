const BACKGROUND_ANIMATION = {
    delay: 1,
    duration: 2,
    scale: "random(0.1, 2)",
    opacity: "random(0.3, 1)",
    x: "random(-300,300)",
    y: "random(-300,300)",
    z: "random(-400,400)",
    rotateX: "random(-360, 360, 180)",
    rotateY: "random(-360, 360, 180)",
    repeat: -1,
    repeatDelay: 2,
    repeatRefresh: true,
    ease: "power2.inOut",
    onRepeat: animationRepeat
};

let focusedBox = -1,
    images = [];

class Media{
    constructor(mediaItem) {
        initField(this, 'mediaItem', {mediaItem}, null, defaultTransformer(MediaItem));
        this.shown = false
        this.chosen = true;
    }

    getUrl(){
        return `${this.mediaItem.baseUrl}=w${this.mediaItem.mediaMetadata.width}-h${this.mediaItem.mediaMetadata.height}`;
    }

    wasUsed(shown){
        if(!isEmpty(shown)){
            this.shown = shown
        }
        return this.shown;
    }

}

const createdIds = [];

class Box {
    constructor(props) {
        initField(this, 'parent', props);
        initField(this, 'element', props);

        this.element = this.element || document.createElement("div");
        this.element.id = makeId(5);
        this.element.setAttribute("class", "cell");
        this.element.style.backgroundPosition = "center";
        this.element.style.backgroundRepeat = "no-repeat";
        this.element.style.backgroundSize = "contain";

        this.changeMediaItem();
        this.addToParent();
    }

    addToParent() {
        if (!isUndefinedOrNull(this.parent)) {
            this.parent.appendChild(this.element);
        }
    }

    /**
     * This function will change the media item to use and load it
     */
    changeMediaItem(){
        const box = this;
        getNextMediaItem()
            .then(media => {
                if(!isEmpty(media)) {
                    box.mediaItem = media;
                    box.loadMedia();
                }
            });
    }

    /**
     * This function will load the specified media item and once downloaded will set the box's background with it
     */
    loadMedia(){
        let image;
        const box = this;

        image = new Image();
        image.src = this.mediaItem.getUrl();
        image.onload = () => {
            box.imageWidth = image.width;
            box.imageHeight = image.height;
            box.element.style.backgroundImage = `url('${image.src}')`;
            // box.element.src = image.src;


        };
    }

    /**
     * This function will start the animation for this box
     */
    startAnimation() {
        this.animation = gsap.to(this.element, {
            ...BACKGROUND_ANIMATION,
            onRepeatParams: [this]
        });
    }

    /**
     * This function will set the focus on this box
     */
    setFocus() {
        let focused, showAnimation,scale;
        const box = this;

        focusedBox = this;
        this.animation.paused(true);
        this.element.removeFromParent();


        focused = getElements(".focused")[0];
        focused.appendChild(this.element);
        scale = window.innerHeight / this.element.clientHeight;
        scale = scale > 1 ? 1 : scale;


        showAnimation = gsap.to(this.element, {
            delay: 1,
            duration: 2,
            opacity: 1,
            repeatDelay: 0,
            repeat: 0,
            rotateX: 0,
            rotateY: 0,
            scale: scale,
            ease: "power1.out",
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-100%",
            z: 500
        });

        setTimeout(() => {
            showAnimation.reverse(0).then(() => box.unfocus());
        }, 60000);
    }

    /**
     * This function will remove the focus on this box
     */
    unfocus() {
        const box = this;
        this.element.removeFromParent();
        getElements(".grid")[0].appendChild(this.element);
        this.animation.paused(false);
        // Remove Focus in 5 seconds
        setTimeout(() => {focusedBox = null}, 5000);

        // Change image in 30 Seconds
        setTimeout(() => {box.changeMediaItem()}, 30000)
    }
}

/**
 * This function will trigger a Repeat Animation on the specified box
 * @param {Box} box Element box to trigger repeat animation
 */
function animationRepeat(box) {
    if (focusedBox === null && Math.random() > 0.8) {
        box.setFocus();
    }
}

/**
 * This function is random text generator of the specified length
 * @param {Number} length Length of the ramdomly generated string
 * @returns {string} Randomly generated String
 */
function generateId(length) {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }

    return result;
}

/**
 * This function will pick a random image of from the list that has not been used
 * @returns {Promise<Media|null>} Selected image
 */
async function getNextMediaItem(){
    return new Promise((resolve) => {
        // Have images been loaded?
        if(isEmpty(images)){
            // Load Images
            getQueue()
                .then(data => {
                    let parameters, photos;
                    [parameters, photos] = data;

                    if(isEmpty(photos)){
                        console.log('No photos returned');
                        getElements('#noPhotos').show();
                    }
                    else {
                        // Prepare photos for display
                        photos.forEach(photo => {
                            // Load Images in queue
                            images.push(new Media(photo));
                        });

                    }
                    resolve(true);
                })
        }
        else {
            resolve(true);
        }
    }).then(() => {
        // Get Photos not used
        const availableImages = images.filter(m => !m.wasUsed())

        // If there are no images reload images
        if(isEmpty(availableImages)){
            images = [];
            return getNextMediaItem();
        }

        // Pick Random Image
        let index = Math.floor(Math.random() * availableImages.length);
        let media = availableImages[index];
        media.wasUsed(true);
        return media;
    });
}

/**
 * This function will generate a unique ID of the specified length
 * @param {Number} length The length of the generated ID
 * @returns {string} The generated ID
 */
function makeId(length) {
    let generatedId = generateId(length);

    while (createdIds.includes(generatedId)) {
        generatedId = makeId(length);
    }

    createdIds.push(generatedId);

    return generatedId;
}