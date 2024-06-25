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

                        $('#example').DataTable({
                            "dom": 'lf<ip>rt<ip>',
							"pageLength": 10,
							"lengthMenu": [ 10, 20, 50 ],
                            "data": results.data,
                            "columns": [
                                {data: '명칭'},
                                {data: '한자'},
                                {data: '위치'},
                                {data: '분류'},
                                {data: '이미지'},
                                {data: '기여자 기록용 별명 (한 번만 적어주시면 됩니다)', visible: false},
                            ],
                            "lengthChange": true,
                            "paging": true,
                            "searching": true,
                            "info": true,
                            "language": {
                                "search": "검색 : ",
                                "searchPlaceholder": "어디를 찾으세요?",
                                "info": "총 _TOTAL_개. 항목을 클릭하면 해당 배치도로 이동합니다.",
                                "infoEmpty": "0개의 항목",
                                "paginate": {
                                    "first": "처음",
                                    "last": "마지막",
                                    "next": "다음",
                                    "previous": "이전"
                                }
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
                                // DataTable 로딩 완료 후 클릭 이벤트 리스너 설정
                                $('#example tbody').on('click', 'tr', function() {
                                    var $this = $(this);
                                    var nameData = $('td', this).eq(0).text();
                                    var categoryData = $("td", this).eq(3).text();
                                    var imageData = $('td', this).eq(4).text(); // 이미지 데이터 가져오기
                                    
                                    // 이미지 데이터에 따라 페이지 이동
                                    if (imageData === '수선전도') {
                                        window.location.href = '/map1.html';
                                    } else if (imageData === '동궐도') {
                                        window.location.href = '/map2.html';
                                    }
                                    
                                    // 세션 스토리지에 데이터 저장
                                    sessionStorage.setItem('selectedNaming', nameData);
                                });
                            }
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
