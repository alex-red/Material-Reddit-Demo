app = angular.module 'dash', ['ngAnimate', 'mgcrea.ngStrap', 'ui.router', 'ngSanitize', 'ngMaterial']

app.config ($stateProvider, $urlRouterProvider) ->
    $urlRouterProvider.otherwise("/index")

    $stateProvider
        .state 'main', {
            url: '/index'
            views: {
                'main': {
                    templateUrl: 'partials/home.html'
                    controller: homeCtrl
                }
            }
        }

app.filter('trusted', ['$sce', ($sce) ->
    return (url) ->
        return $sce.trustAsResourceUrl(url)
])



homeCtrl = ($scope, $interval, $http, $mdDialog, $location, $anchorScroll) ->
    ## JS Helpers
    log = (str) ->
        console.log str
    ## ---

    ## VARS
    $scope.curPage = 1
    $scope.test = "test"
    debug = true
    # Helpers
    $scope.log = (t) ->
        console.log t

    checkImgurAlbum = (str) ->
        if str.match 'imgur.com/a/'
            return true
        else
            return false

    checkWEBM = (str) ->
        if str.match 'gfycat'
            return true
        return false
    $scope.checkContent = (str) ->
        ## Check content type of the input URL
        if checkImgurAlbum str
            res_type = 'imgurAlbum'
        else if checkWEBM str
            res_type = 'WEBM'
        else # Last check
            fileEnding = str.split(".").pop()
            fileEndingArray = ['gif', 'jpg', 'png','jpeg']
            fileEndingArray2 = ['gifv']
            log fileEnding
            if fileEnding in fileEndingArray
                res_type = 'pic'
            else if fileEnding in fileEndingArray2
                res_type = fileEndingArray2[0] # Temporary fix
            else
                res_type = 'imgurPic'
        log "Type of Img : [#{res_type}]"
        return res_type


    $scope.showDialog = (ev, url) ->
        $mdDialog.show(
            controller: DisplayController
            templateUrl: 'partials/image_dialog.html'
            targetEvent: ev
            locals: {currentImg: url, contentType: $scope.checkContent(url)}
            )

    testData = ''''''


    $scope.getRedditKeyDown = (e) ->
        if e.keyCode == 13
            $scope.getReddit($scope.inputSubreddit)
    # Get subreddit objects
    parseData = (d) ->
        dataList = d.data.children # List of feed objects
        $scope.srData = dataList
    $scope.getReddit = (sr) ->
        $scope.curPage = 1
        # sr = subreddit
        $scope.test = sr
        URL = "http://www.reddit.com/r/#{sr}/.json?count=26"
        console.log URL

        $http(
            method: 'GET'
            url: URL
        ).success((d)-> # Got subreddit info, parse
            parseData d)
        .error((d)->
            console.log "error")



        $scope.grabNext = ->
            last = $scope.srData[24]
            id = last.data.name
            subreddit = $scope.inputSubreddit
            URL = "http://www.reddit.com/r/#{subreddit}/.json?count=25&after=#{id}"
            $scope.srData = null
            $http(
                method: 'GET'
                url: URL
            ).success((d)-> # Got subreddit info, parse
                parseData d
                $scope.curPage += 1
                $location.hash 'top'
                $anchorScroll()
                )

            .error((d)->
                console.log "error")

        init = ->
            return
        init()

DisplayController = ($scope, $mdDialog, currentImg, contentType) ->
    $scope.currentImg = currentImg
    $scope.contentType= contentType
    $scope.sanitizeImgurAlbum = (str) ->
        if !str then return
        return str.replace("http:","") + "/embed"

    $scope.sanitizeWEBM = (str) ->
        # Return object of needed web values
        # resObj = {}
        ID = str.slice(str.lastIndexOf('/') + 1)
        # resObj.ID = ID
        # resObj.poster = "http://thumbs.gfycat.com/#{ID}-poster.jpg"
        # resObj.webm = "http://giant.gfycat.com/#{ID}.webm"
        # resObj.mp4 = "ttp://giant.gfycat.com/#{ID}.mp4"
        # log "WEBM --- ID: #{ID}"
        # return resObj
        return "http://gfycat.com/ifr/#{ID}"
    $scope.sanitizeImgur = (str) ->
        return "#{str}.jpg"