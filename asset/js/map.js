$(document).ready(function() {
    var csvFilePath = "asset/csv/data.csv";
    var fullImage = $('#trackingImage');

    function initializeMap() {
        loadSpreadsheetData();
        setPanelWidths();
        initMinimap();
    }

    if (fullImage[0].complete) {
        initializeMap();
    } else {
        fullImage.on('load', initializeMap);
    }

    $(window).on('resize', setPanelWidths);
});

function loadSpreadsheetData() {
    var csvFilePath = "asset/csv/data.csv";

    fetch(csvFilePath)
        .then(response => response.text())
        .then(csvData => {
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: function(results) {
                    var h1Text = $('h1').text();
                    var filteredData = results.data.filter(function(row) {
                        return row['이미지'] === h1Text;
                    });
                    
                    $('#example').DataTable({
                        "dom": 'f<it>',
                        "data": filteredData,
                        "columns": [
                            {data: '명칭'},
                            {data: '한자'},
                            {data: '위치'},
                            {data: '분류'},
                            {data: '이미지', visible: false},
                            {data: '기여자 기록용 별명 (한 번만 적어주시면 됩니다)', visible: false},
                        ],
                        "lengthChange": false,
                        "paging": false,
                        "searching": true,
                        "info": true,
                        "language": {
                            "search": "검색 : ",
                            "searchPlaceholder": "어디를 찾으세요?",
                            "info": "총 _TOTAL_개. 원하는 항목을 클릭하세요.",
                            "infoEmpty": "0개의 항목",
                        },
                        "columnDefs": [
                            {
                                targets: 3,
                                render: function(data, type, row) {
                                    var fillColor = getFillColorByCategory(data);
                                    return `<span style="color: ${fillColor};">${data}</span>`;
                                }
                            }
                        ],
                        "initComplete": function(settings, json) {
                            var uniqueTexts = [];
                            this.api().column(5).data().each(function(value, index){
                                if (value && uniqueTexts.indexOf(value) === -1) uniqueTexts.push(value);
                            });
                            uniqueTexts = uniqueTexts.sort(function(a, b) {
                                return a.localeCompare(b);
                            });
                            var textList = ' ' + uniqueTexts.join(', ');
                            var centerElement = document.querySelector('.contribute');
                            if (centerElement) centerElement.innerText += textList;
                            
                            $('div.dataTables_filter input').focus();

                            const inputField = document.querySelector('#example_filter input[type="search"]');
                            if (inputField) {
                                const storedValue = sessionStorage.getItem('selectedNaming');
                                if (storedValue) {
                                    inputField.value = storedValue;
                                    sessionStorage.removeItem('selectedNaming');
                                }
                            }

                            $('#example tbody').on('click', 'tr', function() {
                                var $this = $(this);
                                var nameData = $('td', this).eq(0).text();
                                var positionData = $('td', this).eq(2).text();
                                var categoryData = $("td", this).eq(3).text();
                                var positions = positionData.split(',');
                                var topPosition = positions[0].trim() + 'px';
                                var leftPosition = positions[1].trim() + 'px';
                                var leftPositionLegend = (parseInt(positions[1].trim()) + 50) + 'px';
                                var markerClass = 'marker-' + nameData.replace(/\s+/g, '-').toLowerCase();
                        
                                var fillColor = getFillColorByCategory(categoryData);
                                
                                if (!$this.hasClass('selected')) {
                                    $this.addClass('selected');
                                    let markerId = positionData;
                                    if ($('#rightPanel').find(`.marker-container[data-marker-id="${markerId}"]`).length === 0) {
                                        var newMarker = $(`
                                            <div class="marker-container" data-marker-id="${positionData}" style="position: absolute; top: ${topPosition}; left: ${leftPosition}; text-align: center;">
                                                <svg class="marker ${markerClass}" xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="${fillColor}" viewBox="0 0 16 16">
                                                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                                                </svg>
                                            </div>
                                            <div style="position: absolute; top: ${topPosition}; left: ${leftPositionLegend};  white-space: nowrap;">
                                                <span class="marker-legend" data-marker-id="${positionData}" style="color: ${fillColor};">${nameData}</span>
                                            </div>
                                        `);
                                        $('#rightPanel').append(newMarker);
                                        newMarker.get(0).scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
                                    }
                                } else {
                                    $this.removeClass('selected');
                                    let markerId = positionData;
                                    $('#rightPanel').find(`.marker-container[data-marker-id="${markerId}"]`).remove();
                                    $('#rightPanel').find(`.marker-legend[data-marker-id="${markerId}"]`).remove();
                                }
                        
                                $('.marker').css('animation', 'none');
                                setTimeout(function() {
                                    $('.marker').css('animation', '');
                                }, 10);
                            });
                        }
                    });

                    $('#selectAll').on('click', function() {
                        $('#example').DataTable().$('tr').each(function() {
                            var $this = $(this);
                            if (!$this.hasClass('selected')) {
                                $this.addClass('selected');
                                var nameData = $('td', this).eq(0).text();
                                var positionData = $('td', this).eq(2).text();
                                var categoryData = $("td", this).eq(3).text();
                                var positions = positionData.split(',');
                                var topPosition = positions[0].trim() + 'px';
                                var leftPosition = positions[1].trim() + 'px';
                                var leftPositionLegend = (parseInt(positions[1].trim()) + 50) + 'px';
                                var markerClass = 'marker-' + nameData.replace(/\s+/g, '-').toLowerCase();

                                var fillColor = getFillColorByCategory(categoryData);
                                var newMarker = $(`
                                <div class="marker-container" data-marker-id="${positionData}" style="position: absolute; top: ${topPosition}; left: ${leftPosition}; text-align: center;">
                                    <svg class="marker ${markerClass}" xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="${fillColor}" viewBox="0 0 16 16">
                                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                                    </svg>
                                </div>
                                <div style="position: absolute; top: ${topPosition}; left: ${leftPositionLegend};  white-space: nowrap;">
                                    <span class="marker-legend" data-marker-id="${positionData}" style="color: ${fillColor};">${nameData}</span>
                                </div>
                                `);

                                $('#rightPanel').append(newMarker);
                            }
                        });

                        $('.marker').css('animation', 'none');
                        setTimeout(function() {
                            $('.marker').css('animation', '');
                        }, 10);
                    });

                    $('#deselectAll').on('click', function() {
                        $('#example').DataTable().$('tr.selected').removeClass('selected');
                        $('#rightPanel').find('.marker-container').remove();
                        $('#rightPanel').find('.marker-legend').remove();
                    });
                }
            });
        })
        .catch(() => console.log("Can't access response. Blocked by browser?"))
}

function setPanelWidths() {
    var windowWidth = $(window).width();
    var leftPanelWidth = 400; // CSS에서 설정한 너비
    var rightPanelWidth = windowWidth - leftPanelWidth;

    $('#leftPanel').width(leftPanelWidth);
    $('#rightPanel').css({
        'width': rightPanelWidth + 'px'
    });

    updateMinimapViewport();
}

function initMinimap() {
    var minimap = $('#minimap');
    var fullImage = $('#trackingImage');
    var aspectRatio = fullImage.width() / fullImage.height();
    
    var minimapWidth = 150; // 고정된 가로 크기
    var minimapHeight = minimapWidth / aspectRatio;

    minimap.css({
        width: minimapWidth + 'px',
        height: minimapHeight + 'px'
    });

    updateMinimapViewport();

    $('#rightPanel').on('scroll', updateMinimapViewport);

    $('#minimap').on('mousedown', function(e) {
        e.preventDefault();
        var minimap = $('#minimap');
        var rightPanel = $('#rightPanel');
        var fullImage = $('#trackingImage');

        var clickX = e.pageX - minimap.offset().left;
        var clickY = e.pageY - minimap.offset().top;

        var scaleX = fullImage.width() / minimap.width();
        var scaleY = fullImage.height() / minimap.height();

        var scrollX = clickX * scaleX - rightPanel.width() / 2;
        var scrollY = clickY * scaleY - rightPanel.height() / 2;

        rightPanel.scrollLeft(scrollX);
        rightPanel.scrollTop(scrollY);
    });
}

function updateMinimapViewport() {
    var rightPanel = $('#rightPanel');
    var minimap = $('#minimap');
    var indicator = $('#viewport-indicator');
    var fullImage = $('#trackingImage');

    var panelWidth = rightPanel.width();
    var panelHeight = rightPanel.height();
    var contentWidth = fullImage.width();
    var contentHeight = fullImage.height();

    var scaleX = minimap.width() / contentWidth;
    var scaleY = minimap.height() / contentHeight;

    var indicatorWidth = Math.min(panelWidth * scaleX, minimap.width());
    var indicatorHeight = Math.min(panelHeight * scaleY, minimap.height());

    var indicatorX = (rightPanel.scrollLeft() * scaleX);
    var indicatorY = (rightPanel.scrollTop() * scaleY);

    indicator.css({
        width: indicatorWidth + 'px',
        height: indicatorHeight + 'px',
        left: indicatorX + 'px',
        top: indicatorY + 'px'
    });
}

function getFillColorByCategory(category) {
    switch (category) {
        case '문':
            return '#0a82ff';
        case '지명':
            return '#2c952c';
        case '건물':
            return '#ff607f';
        case '미상':
            return '#c714e3';
        default:
            return '#ffa500';
    }
}