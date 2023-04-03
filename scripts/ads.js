;(function () {
    let adsLoaded = false
    let resizeId = null

    let videoElement
    let adContainer
    let adDisplayContainer
    let adsLoader
    let adsManager

    window.addEventListener('resize', function (event) {
        if (resizeId != null) {
            this.cancelAnimationFrame(resizeId)
        }
        resizeId = this.requestAnimationFrame(() => {
            resizeAdsManager()
            resizeId = null
        })
    })

    function resizeAdsManager() {
        if (adsManager) {
            const width = window.innerWidth
            // Also kinda hack.
            // Making sure that ad container doesn't cover controls
            // after ad is done playing
            const height = window.innerHeight * 0.65
            adsManager.resize(width, height, google.ima.ViewMode.NORMAL)
        }
    }

    function initializeIMA(video) {
        videoElement = video
        adContainer = document.getElementById('ad-container')
        adContainer.addEventListener('click', adContainerClick)
        adDisplayContainer = new google.ima.AdDisplayContainer(
            adContainer,
            videoElement
        )
        adsLoader = new google.ima.AdsLoader(adDisplayContainer)
        videoElement.addEventListener('ended', function () {
            adsLoader.contentComplete()
        })
        adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            onAdsManagerLoaded,
            false
        )
        adsLoader.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            onAdError,
            false
        )

        const adsRequest = new google.ima.AdsRequest()
        adsRequest.adTagUrl =
            'https://pubads.g.doubleclick.net/gampad/ads?' +
            'iu=/21775744923/external/single_ad_samples&sz=640x480&' +
            'cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&' +
            'gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator='

        const [targetWidth, targetHeight] = [
            window.innerWidth,
            window.innerHeight * 0.8,
        ]
        adsRequest.linearAdSlotWidth = targetWidth
        adsRequest.linearAdSlotHeight = targetHeight
        adsRequest.nonLinearAdSlotWidth = targetWidth
        adsRequest.nonLinearAdSlotHeight = targetHeight / 3

        // Pass the request to the adsLoader to request ads
        adsLoader.requestAds(adsRequest)
        videoElement.play()
    }
    function loadAds(event) {
        // This is kinda hack but it helps to resize ad manager
        // after player changes height from 0 to 80% on the first render
        window.dispatchEvent(new Event('resize'))
        // Prevent this function from running on if there are already ads loaded
        if (adsLoaded) {
            return
        }
        adsLoaded = true

        // Prevent triggering immediate playback when ads are loading
        event.preventDefault()

        videoElement.pause()
        adDisplayContainer.initialize()

        const width = videoElement.clientWidth
        const height = videoElement.clientHeight
        try {
            adsManager.init(width, height, google.ima.ViewMode.NORMAL)
            adsManager.start()
        } catch (adError) {
            // Play the video without ads, if an error occurs
            console.log('AdsManager could not be started')
            videoElement.play()
        }
    }
    function onAdsManagerLoaded(adsManagerLoadedEvent) {
        // Instantiate the AdsManager from the adsLoader response and pass it the video element
        adsManager = adsManagerLoadedEvent.getAdsManager(videoElement)
        adsManager.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            onAdError
        )
        adsManager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
            onContentPauseRequested
        )
        adsManager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
            onContentResumeRequested
        )
        adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdLoaded)
    }

    function onContentPauseRequested() {
        videoElement.pause()
    }

    function onContentResumeRequested() {
        videoElement.play()
    }

    function adContainerClick(event) {
        console.log('ad container clicked')
        if (videoElement.paused) {
            videoElement.play()
        } else {
            videoElement.pause()
        }
    }

    function onAdLoaded(adEvent) {
        var ad = adEvent.getAd()
        if (!ad.isLinear()) {
            videoElement.play()
        }
    }

    function onAdError(adErrorEvent) {
        // Handle the error logging.
        console.log(adErrorEvent.getError())
        if (adsManager) {
            adsManager.destroy()
        }
    }
    const ads = { loadAds, initializeIMA }
    Object.freeze(ads)
    window.ads = ads
})()
