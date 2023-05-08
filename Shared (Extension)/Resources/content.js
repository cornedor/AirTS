async function showPlaybackTargetPickerForActiveAudio() {
    // Loop over all audio elements, and find the playing one. At this
    // time there are two options:
    //   1. The audio element used for live streams: `#nts-player-audio`
    //   2. Another audio element that is used for on-demand streams.
    const audios = document.querySelectorAll('audio');
    for (const audio of audios) {
        if (audio.paused) {
            continue;
        }
        try {
            audio.webkitShowPlaybackTargetPicker();
        } catch {
            // if it fails, it fails ¯\_(ツ)_/¯
        }
        return
    }
}

const airplayIcon = document.createElement('img')
airplayIcon.src = browser.runtime.getURL("images/airplay.svg");

// Button that is shown on desktop
const airTSButton = document.createElement('button');
airTSButton.classList = 'live-header__airplay';
airTSButton.appendChild(airplayIcon);

airTSButton.addEventListener('click', (e) => {
    e.preventDefault();
    showPlaybackTargetPickerForActiveAudio();
});

// Button that is shown on mobile
const mobileAirTSButton = document.createElement('button');
mobileAirTSButton.classList = 'live-header__footer__button live-header__airplay';
mobileAirTSButton.appendChild(airplayIcon.cloneNode());

mobileAirTSButton.addEventListener('click', (e) => {
    e.preventDefault();
    showPlaybackTargetPickerForActiveAudio();
});

// TODO: There might be a faster solution. (MutationObserver perhaps?)
window.addEventListener('load', () => {
    // When AirPlaying the live player, the audio often switches back to
    // the host device. To fight this the pause event is prevented. This
    // event is randomly triggered when focus is lost/regained, or when
    // the user navigates the app.
    // This will not change the behaviour of the app, if the stop button
    // is clicked, the source is set, and the emptied event is triggered.
    const live = document.querySelector('#nts-player-audio')
    live.addEventListener('pause', (e) => {
        e.preventDefault();
        console.log('AirTS - Pause prevented', e)
    })
    live.addEventListener('play', (e) => {
        e.preventDefault();
        console.log('AirTS - Play triggered', e)
        // Re-triggering play. This also seems to prevent some issues. Need
        // to investigate further.
        live.play();
    })
    live.addEventListener('stop', (e) => {
        e.preventDefault();
        console.log('AirTS - Stop prevented', e)
    })
    live.addEventListener('emptied', e => console.log('AirTS - emptied', e))
    
    // Add a AirPlay button to the live header on desktop...
    const liveHeader = document.querySelector('.live-header__footer:not(.live-header__footer--mobile)');
    if (liveHeader) {
        const volumeButton = liveHeader.querySelector('.volume-control');
        liveHeader.insertBefore(airTSButton, volumeButton);
    }
    
    // ... and on mobile
    const liveHeaderMobile = document.querySelector('.live-header__footer--mobile')
    if (liveHeaderMobile) {
        liveHeaderMobile.insertBefore(mobileAirTSButton, liveHeaderMobile.childNodes[0]);
    }
})

