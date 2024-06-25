$(document).ready(function() {
	var csvFilePath = "asset/csv/data.csv";

	function loadSpreadsheetData() {
		fetch(csvFilePath)
			.then(response => response.text())
			.then(csvData => {
				Papa.parse(csvData, {
					header: true, // 첫 번째 행을 필드 이름으로 사용
					skipEmptyLines: true, // 비어 있는 행 무시
					dynamicTyping: true, // 숫자, 불리언 값은 자동으로 해당 타입으로 변환
					complete: function(results) {
						var h1Text = $('h1').text();
						var filteredData = results.data.filter(function(row) {
							return row['이미지'] === h1Text;
						});

						$('#example').DataTable({
							"dom": 'f<it>',
							"data": filteredData, // 필터링된 데이터 사용
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
								// 기여자 자동으로 중복 제거한 후 넣기
								var uniqueTexts = [];
								this.api().column(5).data().each(function(value, index){
									if (value && uniqueTexts.indexOf(value) === -1) uniqueTexts.push(value);
								});
								uniqueTexts = uniqueTexts.sort(function(a, b) {
									return a.localeCompare(b);
								});
								var textList = ' ' + uniqueTexts.join(', '); // 리스트 앞에 공백 추가
								var centerElement = document.querySelector('.contribute');
								if (centerElement) centerElement.innerText += textList;
								
								// DataTable 로딩 완료 후 클릭 이벤트 리스너 설정
								$('div.dataTables_filter input').focus();
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
							
									// 분류에 따라 색상 결정
									var fillColor = getFillColorByCategory(categoryData);
									
									var naming = sessionStorage.getItem('selectedNaming'); // 세션 스토리지에서 명칭 가져오기
									if (naming) {
										// 해당 명칭을 가진 요소 찾기
										var $this = $(`[data-naming="${naming}"]`);

									if (!$this.hasClass('selected')) {
										$this.addClass('selected');
										let markerId = positionData; // 마커 ID 설정
										// 해당 ID를 가진 마커가 이미 존재하는지 확인
										if ($('#rightPanel').find(`.marker-container[data-marker-id="${markerId}"]`).length === 0) {
											// 마커가 존재하지 않으면 새로 추가
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
							
											// 마커 위치 재조정 로직 삭제
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
						// '전체선택' 버튼 클릭 이벤트
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

									// 분류에 따라 색상 결정
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

						// '선택해제' 버튼 클릭 이벤트
						$('#deselectAll').on('click', function() {
							$('#example').DataTable().$('tr.selected').removeClass('selected');
							$('#rightPanel').find('.marker-container').remove();
							$('#rightPanel').find('.marker-legend').remove();
						});

					}
				});
			})
			.catch(() => console.log("Can’t access response. Blocked by browser?"))
	}
	loadSpreadsheetData();
});

$(document).ready(function () {
	var fixedX = -1; // 고정된 X 좌표값을 저장하기 위한 변수
	var fixedY = -1; // 고정된 Y 좌표값을 저장하기 위한 변수
	var isPositionFixed = false; // 위치가 고정되었는지 확인하기 위한 변수

	// 이미지 위에서 클릭 이벤트 처리
	$('#rightPanel img').click(function(e) {
		isPositionFixed = true; // 위치 고정
		// 이미지 내에서의 마우스 상대 위치 계산
		var relX = e.pageX - $(this).offset().left;
		var relY = e.pageY - $(this).offset().top;
		// 고정된 위치값 저장
		fixedX = Math.round(relX) - 23;
		fixedY = Math.round(relY) - 40;
		// 왼쪽 패널에 고정된 위치 표시
		$('#mousePosition').text(fixedY + ', ' + fixedX);
	});

	// '설문 창 열기' 버튼 클릭 이벤트
	$('#openSurveyBtn').click(function() {
		if (!isPositionFixed) {
			alert('먼저 이미지에서 위치를 선택해주세요.');
			return; // 위치가 고정되지 않았다면 함수 종료
		}
		// 위치 복사 기능 실행
		var positionText = $('#mousePosition').text(); // jQuery를 사용하여 텍스트 가져오기
		var textarea = document.createElement('textarea');
		textarea.value = positionText; // textContent 대신 value 사용
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand('copy');
		document.body.removeChild(textarea);

		// 설문 링크 생성 및 열기
		const imageTitle = document.querySelector('h1').textContent;
		const surveyLink = `https://docs.google.com/forms/d/e/1FAIpQLSdq6UIihsR8CwrwrHiBgAQXgY00mPzyny3nl2YSwBNNbe0_kA/viewform?entry.1009188269=${encodeURIComponent(positionText)}&entry.683431722=${encodeURIComponent(imageTitle)}`;
		window.open(surveyLink, '_blank');
	});
});

// 위치값 복사 시 모달
document.getElementById('mousePosition').addEventListener('click', function() {
    const modal = document.getElementById('modal');
    const textValue = this.innerText;

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('Async: Copying to clipboard was successful!');
        }, function(err) {
            console.error('Async: Could not copy text: ', err);
        });
    }

    if (textValue === '없음') {
        modal.innerText = '위치값이 없습니다.';
    } else {
        modal.innerText = '위치값이 복사되었습니다.';
        copyToClipboard(textValue);
    }

    modal.style.display = 'block';

    setTimeout(function() {
        modal.style.display = 'none';
    }, 2000);
});

// 'zoomButton'이 존재하는지 확인
var zoomButton = document.getElementById('zoomButton');
if (zoomButton) {
    zoomButton.addEventListener('click', function() {
        var image = document.getElementById('trackingImage');
        var overlay = document.getElementById('overlay');

        // 오버레이 상태에 따라 보여주거나 숨기기
        if (overlay.style.display === 'grid') {
            // 오버레이가 이미 표시되어 있다면 숨깁니다.
            overlay.style.display = 'none';
        } else {
            // 오버레이가 표시되지 않았다면, 이미지 로드 후 오버레이 설정
            image.onload = function() {
                overlay.style.display = 'grid';
                overlay.style.width = image.width + 'px'; // 이미지의 실제 너비
                overlay.style.height = image.height + 'px'; // 이미지의 실제 높이
                overlay.style.gridTemplateColumns = 'repeat(16, 1fr)';
                overlay.style.gridTemplateRows = 'repeat(6, 1fr)';
                overlay.innerHTML = '';

                for (let row = 1; row <= 6; row++) {
                    for (let col = 1; col <= 16; col++) {
                        const cell = document.createElement('div');
                        // 숫자 위치 변경
                        const number = (6 - row) * 100 + col + 100;
                        cell.textContent = number;
                        cell.addEventListener('click', function() {
                            window.open('asset/image/image_tile_dong/' + number + '.jpg');
                        });
                        overlay.appendChild(cell);
                    }
                }
            };

            // 이미지가 이미 로드된 상태라면 onload 이벤트를 강제로 실행
            if (image.complete || image.naturalWidth !== 0) {
                image.onload();
            }
        }
    });
}

// 위치 분류에 따라 색상 지정
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
