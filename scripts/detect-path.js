(function () {
    const log = (msg) => console.log(`[Nexus Detect] ${msg}`);

    try {
        log('Starting improved scan...');

        // Helper to find React key on a node
        const getReactKey = (node) => Object.keys(node).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));

        // 1. Try common roots first (faster/more reliable)
        const roots = [
            document.getElementById('__next'),
            document.getElementById('root'),
            document.querySelector('#app'),
            document.body.firstElementChild
        ].filter(Boolean);

        let foundSource = null;
        let isReactFound = false;

        const checkNode = (node) => {
            const key = getReactKey(node);
            if (key) {
                isReactFound = true;
                const fiber = node[key];

                // Traverse up/down a bit if needed, or check return
                let curr = fiber;
                while (curr) {
                    if (curr._debugSource && curr._debugSource.fileName) {
                        return curr._debugSource.fileName;
                    }
                    // Check child or stateNode if useful? Usually just traversing fiber return (parent)
                    // Actually _debugSource is on the fiber node itself created by Babel plugin
                    curr = curr.return; // Go up tree
                }
            }
            return null;
        };

        // method A: Check known roots
        for (const root of roots) {
            const path = checkNode(root);
            if (path) {
                foundSource = path;
                break;
            }
        }

        // method B: Tree walker if A failed
        if (!foundSource) {
            log('Roots failed, scanning full tree...');
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
            let node;
            while (node = walker.nextNode()) {
                const path = checkNode(node);
                if (path) {
                    foundSource = path;
                    break;
                }
            }
        }

        if (foundSource) {
            log('Found raw path: ' + foundSource);

            const markers = ['/src/', '/app/', '/pages/', '/components/', '/lib/', '/hooks/', '/views/'];
            let root = foundSource;
            for (const m of markers) {
                const idx = foundSource.lastIndexOf(m);
                if (idx !== -1) {
                    root = foundSource.substring(0, idx);
                    break;
                }
            }

            window.postMessage({ type: 'NEXUS_DETECT_PATH_RESULT', path: root }, '*');
        } else {
            if (isReactFound) {
                log('React found but no _debugSource. Are you in Production mode?');
            } else {
                log('No React roots found.');
            }
            window.postMessage({ type: 'NEXUS_DETECT_PATH_RESULT', path: null, error: isReactFound ? 'PROD_MODE' : 'NO_REACT' }, '*');
        }

    } catch (e) {
        console.error('[Nexus Detect] Error:', e);
        window.postMessage({ type: 'NEXUS_DETECT_PATH_RESULT', path: null }, '*');
    }
})();
