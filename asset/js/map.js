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

								//홈화면에서 클릭한 항목이 있을 때 그 항목만 필터링
								const inputField = document.querySelector('#example_filter input[type="search"]');
								if (inputField) {
									const storedValue = sessionStorage.getItem('selectedNaming');
									if (storedValue) {
										inputField.value = storedValue;

										// 엔터키 이벤트 생성 및 트리거
										const event = new KeyboardEvent('keydown', {
											bubbles: true,
											cancelable: true,
											key: 'Enter',
											code: 'Enter',
											keyCode: 13
										});
										inputField.dispatchEvent(event);
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
							
									// 분류에 따라 색상 결정
									var fillColor = getFillColorByCategory(categoryData);
									
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
