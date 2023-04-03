;(function () {
    // State
    const showsById = {}
    const categories = []
    const showIdsByCategory = {}
    let initialized = false

    // Elements
    const AppContainer = document.getElementById('app')
    const ContentContainer = document.getElementById('content')
    const Player = document.getElementById('video')
    const VideoContainer = document.getElementById('video-container')
    const VideoTitle = document.getElementById('video-title')

    // Helpers
    function showError(err) {
        // TODO: Add UI to gracefully show errors while fetching
        console.log('Oops! Something went wrong while fetching shows 🤷‍♂️')
        console.log(err)
    }

    const { helpers, CONSTANTS, ads } = window
    if (!CONSTANTS)
        throw new Error('Please include constants.js as a first script')
    if (!ads) throw new Error('Please include ads.js script before index.js')
    if (!helpers)
        throw new Error('Please include components.js script before index.js')
    const { loadAds, initializeIMA } = ads

    Player.addEventListener('play', function (event) {
        loadAds(event)
    })

    document.addEventListener(CONSTANTS.EVENTS.PLAY, (e) => {
        const { detail } = e

        Player.src = detail.url
        VideoTitle.innerText = detail.title
        VideoContainer.setAttribute('init', true)
        window.scroll(0, 0)
        Player.play()
    })

    fetch('https://a.jsrdn.com/interview.json')
        .then((resp) => resp.json())
        .then((data) => {
            if (data.shows) {
                // data setup
                data.shows.forEach((show) => {
                    showsById[show.id] = show
                    if (showIdsByCategory[show.category] == null) {
                        categories.push(show.category)
                        showIdsByCategory[show.category] = []
                    }

                    ;(show.category !== 'Business' ||
                        showIdsByCategory[show.category].length < 3) &&
                        showIdsByCategory[show.category].push(show.id)
                })

                // first render
                for (const category of categories) {
                    const { categoryContainer, showContainer } =
                        helpers.renderCategory({ category })
                    ContentContainer.appendChild(categoryContainer)

                    const shows = showIdsByCategory[category].map(
                        (id) => showsById[id]
                    )
                    const children = shows.map(helpers.renderCard)
                    showContainer.append(...children)
                }
                if (!initialized) {
                    initializeIMA(Player)
                    initialized = true
                }
            }
        })
        .catch(showError)
})()
