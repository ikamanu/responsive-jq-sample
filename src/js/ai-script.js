    /***
     *
     *  Simple Responsive jQuery Sample -- 8/7/2015
     *  ---------------------------------------------
     *  Criteria :
     *  1. Use JQuery
     *  2. Build a responsive 'class="container"' div that'll hold a tab module
     *  3. Build a responsive tab/tab-content module (tabs-to-accordion)
     *  4. Build a hash-bang-slash (i.e. "#!/") URL navigation system
     *
     *  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     *  PLEASE READ the comments here. They justify every decision made
     *  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     *
     *  Considerations:
     *  1. Separating selective logic (outside of closures) for
     *     readability in lieu of succintness
     *
     *  2. For extensibility, applying a crude dirty-repaint (or invalidate-update)
     *     cycle, as would be used in production (makes code more maintainable).
     *
     ***/

    // ========================================================================================
    // Init logic
    // ========================================================================================
    /***
     * Initialize globals, etc
     * ------------------------
     **/

    "use strict";

    /***
     * Handler for the document's ready event.
     * ----------------------------------------
     **/
    function onDocumentReady(){

        // Assign listeners needed on initialization
        assignInitListeners();

        // Force the rendering cycle to trigger an update
        renderUI();

        // Handle deep linking
        deeplinkToSection();

    }

    /**
     * Assign listener for document ready event
     * ----------------------------------------
     **/
    $(document).ready(onDocumentReady);


    /***
     * Assign listeners needed at initialization
     * ------------------------------------------
     **/
    function assignInitListeners(){

        // Assign listener for the resize event
        $(window).resize(invalidateUI);

        // add listeners for hash update
        addNavHashHandling( );

        // add listeners for popstate
        addPopstateHandling();
        
        // ... additional listeners here ...

    }

    // ========================================================================================
    // Rendering > UI lifecycle logic
    // ========================================================================================
    /***
     * Invalidate the ui / flag as 'dirty' if needed
     * and subsequently check if a redraw is needed
     * ---------------------------------------------
     **/
    function  invalidateUI() {

        // NOTE: Here we would have logic to determine
        // if a re-rendering was needed. For the purposes
        // of this demo, we will always re-render.
        if (true) {

            var mobilePortrait = false;

            //if on a mobile device in portrait mode, render accordion
            if( isMobileDevice() && isPortraitMode() ) {
                mobilePortrait = true;
            }

            renderUI( mobilePortrait );
        }
    }



    /***
     * Call all routines needed to update the UI
     * --------------------------------------------
     */
    function renderUI( mobilePortrait ) {

        // For clarity
        var forceAccordion = !!mobilePortrait;

        updateNavContainer( forceAccordion );

        centerContent();
    }

    // ========================================================================================
    // Rendering > Responsive logic
    // ========================================================================================

    /***
     * Logic to Update the container when criteria is met.
     * ------------------------------------------------------------------
     */
    function updateNavContainer( forceAccordion ){

        if (shouldRenderAsTabs() && !forceAccordion ) {

            // render content in a tab navigator
            renderAsTabNav();

        } else {

            // render the content in an accordion navigator
            renderAsAccordionNav();
        }


    }

    /***
     * Renders our content in an Accrodion Nav container
     * note: this code assumes we are transforming
     * an acordion to a tab nav.
     * -------------------------------
     */
    function renderAsAccordionNav() {

        // For every ".container" we find...
        $('.container').each(function () {

            // Create a new div in which we will create the new widget
            var newContainerDiv = $('<div class="new-container">');

            // Confirm we are coming from a non accordion navigator
            // (a tab- ui>lis structure
            if (!isAccNav($(this))) {

                // for each of the section headers (currently as li tabs),
                // generate an accordion header for each, and pass on the sectionName
                var sectionHeaderArray = [];

                $(this).find('ul>li').each(function () {
                    sectionHeaderArray.push('<h3 data-section-name="'+
                                               $(this).data("sectionName") +'" >' + $(this).text() +
                                            '</h3>');
                });

                // for each of the section content divs,
                // generate a new simple div for  header for each
                var sectionDivArray = [];

                $(this).find('>div').each(function () {
                    sectionDivArray.push('<div>' + $(this).html() + '</div>');
                });

                // construct the accordion DOM
                for (var i = 0; i < sectionHeaderArray.length; i++) {
                    newContainerDiv.append(sectionHeaderArray[i]).append(sectionDivArray[i]);
                }

                // Init the new accordion with the current active tab index, if available
                var activeIndex =  !isTabNav($(this)) ? 0 : $(this).tabs( "option", "active" );
                newContainerDiv.accordion( {active:activeIndex, heightStyle:"content"} );

                // insert the new container div in place of the current one,
                $(this).replaceWith(newContainerDiv);

                // add listeners for hash update
                addNavHashHandling( );


            }
        });

        // update the class "new-container" to '.container' ;
        // note: we didnt want to do this while iterating through ".container"
        $('.new-container').removeClass('new-container').addClass('container');
    }

    /**
     * Renders our content in a tab Nav container
     * note: this code assumes we are transforming
     * an acordion to a tab nav. AND also assumes
     * that the default content structure is
     * for Tab Navigation (ul & lis)
     * -------------------------------------------
     */
    function renderAsTabNav() {

        // For every ".container" we find...
        $('.container').each(function () {

            // Create a new div in which we will create the new widget
            var newContainerDiv = $('<div class="new-container">');

            // since transforming from accordion to a tab navigator
            // we will need to perform the checks accordingly,
            if (!isTabNav($(this)) && isAccNav($(this))) {
                var sectionIndex = 0;
                var liParent = $('<ul>');

                // Find each section h3, and create a corresponding li
                $(this).find('h3').each(function () {
                    sectionIndex++;


                    liParent.append('<li  data-section-name="'+ $(this).data("sectionName") +'" >' +
                                    '<a href="#section-' + sectionIndex + '">' + $(this).text() + '</a></li>');
                });

                // Find each section div and store it in a new empty dom element for repositioning
                var divHolder = $('');

                sectionIndex = 0;
                $(this).find('div').each(function () {
                    sectionIndex++;
                    divHolder = divHolder.add('<div id="section-' + sectionIndex + '">' + $(this).html() + '</div>');
                });

                // construct the tabs DOM in the new container div
                newContainerDiv.append(liParent).append(divHolder);


                // Init the new tab nav with the current active accordion index
                var activeIndex = !isAccNav($(this)) ? 0 : $(this).accordion( "option", "active" );
                newContainerDiv.tabs( {active:activeIndex} );

                // insert the new container div in place of the current one,
                // and remove the current one.
                $(this).replaceWith(newContainerDiv);

                // add listeners for hash update
                addNavHashHandling( );

            }
            else if( !isTabNav($(this)) &&  !isAccNav($(this)) ){
                // on the first run, the content will neither be tab nor accordion
                // explicitly make the container an accordion
                $(this).tabs();
            }
        });


        // update the class "new-container" to '.container' ;
        // note: we didnt want to do this while iterating through ".container"
        $('.new-container').removeClass('new-container').addClass('container');

    }

    /***
     * Center the content, reactively
     * -------------------------------
     */
    function centerContent() {
        $('.container').css({
            position:'absolute',
            left: ($(window).width() - $('.container').outerWidth())/2,
            top: ($(window).height() - $('.container').outerHeight())/2
        });
    }

    // ========================================================================================
    // Navigation logic
    // ========================================================================================

    /**
     * Abstracting this as the hashbang approach is deprecated.
     * If this code were to evolve, we would need to change this logic
     * @returns {string}
     * ---------------------------------------------------------------
     */
    function getDeepLinkSection(){

        var urlHash = window.location.hash;
        var sectionName = "";

        if (urlHash !== "") {
            sectionName = urlHash.substring(3, urlHash.length);
        }

        return sectionName;
    }


    /***
     * Deeplink to the section corresponding to the hashbang value .
     *
     * The value corresponds with the data-sectionName attribute / sectionName prop.
     * ------------------------------------------------------------------------------
     */
    function deeplinkToSection(  ){


        $('.container').each(function () {
            // Helper variables
            var sectionIndex = 0;
            var deepLinkIndex = 0;
            var deepLinkSection = getDeepLinkSection();



            // Depending on the type of container,
            // set values for the selector we wil use
            // to find the section index.
            var containerSelector = "";
            var containerType = "tabs";

            if (isAccNav($(this))) {
                containerSelector = "h3";
                containerType = "accordion";
            } else if (isTabNav($(this))) {
                containerSelector = "ul>li";
                containerType = "tabs";
            }


            // Now we know what kind of container it is,
            // we can loop through the relevant sections
            // and check for a match against the hash value
            $(this).find(containerSelector).each(function () {

                if ($(this).data("sectionName") === deepLinkSection) {
                    deepLinkIndex = sectionIndex;
                    return false;
                }

                sectionIndex++;
            });

            $(this)[containerType]("option", "active", deepLinkIndex);

        });

    }

    /***
     * Handle anchor clicks; we will need to update the hash location on click
     * ------------------------------------------------------------------------
     */
    function addNavHashHandling( ) {
       $('a').click(function (evt) {
            evt.preventDefault();

            // update location hash
            if (history.pushState) {
                history.pushState(null, null, "#!/"+$(this).parent().attr('data-section-name'));
            }
            return false;
        });

        $('h3').click(function (evt) {
            evt.preventDefault();

            // update location hash
            if (history.pushState) {
                history.pushState(null, null, "#!/"+$(this).attr('data-section-name'));
            }
            return false;
        });

    }

    /***
     * Handle state being popped off the history stack by browser interaction
     * --------------------------------------------------------------------------
     */
    function addPopstateHandling() {

        $(window).bind('popstate', function (event) {
                deeplinkToSection();
        });
    }
    // ========================================================================================
    // Helper methods
    // ========================================================================================
    /***
     * Returns flag indicating if passed container is a tab container or not
     * This logic is abstracted here, as it may be subject to change and will be easier to migrate.
     * @param jQueryDiv
     * @returns {boolean}
     */
    function isTabNav( jQueryDiv ) {
        return ( !!jQueryDiv.data("ui-tabs") );
    }

    /***
     * Returns flag indicating if passed container is an accordion or not
     * This logic is abstracted here, as it may be subject to change and will be easier to migrate.
     * @param jQueryDiv
     * @returns {boolean}
     */

    function isAccNav( jQueryDiv ) {
        return ( !!jQueryDiv.data("ui-accordion") );
    }

    /***
     * Check which is criteria is met regarding how to render the nav component.
     * This criteria could change at any time, per business requirements.
     *
     * NOTE: Ideally this would be even more robust,
     * eg: "getPreferredContainer( )", which would check criteria for possible containers
     *     horizontalAccordion, viewStacks, flat list, columns, someCustomNavigator, etc
     * -------------------------------------------------------------------------------------
     * @returns {boolean} value that indicates if nav should render as tabs
     */
    function shouldRenderAsTabs() {
        if ($(window).width() > 480) {
            return true;
        }
        else {
            return false;
        }
    }

    /***
     * Simple check to determine if device is a mobile device
     * @returns {boolean}
     * -------------------------------------------------------
     */
    function isMobileDevice() {
        try{
            document.createEvent("TouchEvent"); return true;
        }
        catch(e){
            return false;
        }
    }

    /**
     * Simple check to see if browser window is in portrait mode
     * @returns {boolean}
     * --------------------------------------------------------------
     */
    function isPortraitMode(){
        return ( window.innerHeight > window.innerWidth );
    }

