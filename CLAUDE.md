# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

조선시대 궁궐 및 한양 배치도를 검색할 수 있는 정적 웹사이트. GitHub Pages로 호스팅되며, 사용자가 건물 명칭을 검색하면 해당 위치를 지도 이미지 위에 마커로 표시한다.

## 개발 환경

- **호스팅**: GitHub Pages (정적 사이트)
- **로컬 개발**: 브라우저에서 직접 HTML 파일 열기 또는 로컬 서버 실행
- **빌드 도구**: 없음 (순수 HTML/CSS/JavaScript)

```bash
# 로컬 서버 실행 (Python)
python3 -m http.server 8000

# 또는 Node.js
npx serve .
```

## 아키텍처

### 페이지 구조
- `index.html`: 메인 페이지 - 모든 배치도 카드 목록 및 전체 데이터 검색
- `map[1-5].html`: 개별 배치도 상세 페이지 (수선전도, 동궐도, 북궐도형, 서궐도안, 숙천제아도)
- `work[1-5].html`: 기여자용 작업 페이지 (위치값 입력 기능 포함)

### JavaScript 모듈
- `asset/js/map.js`: 상세 페이지용 - CSV에서 데이터 로드, DataTables 초기화, 마커 표시, 미니맵 기능
- `asset/js/map-all.js`: 메인 페이지용 - 모든 데이터 통합 검색
- `asset/js/work.js`: 기여자용 - 클릭 위치 좌표 추출 및 Google Forms 연동

### 데이터 흐름
1. `asset/csv/data.csv`에서 건물 데이터 로드 (PapaParse 사용)
2. `h1` 태그 텍스트로 해당 배치도 데이터만 필터링
3. DataTables로 검색 가능한 테이블 렌더링
4. 테이블 행 클릭 시 `#rightPanel` 이미지 위에 SVG 마커 추가

### 분류별 마커 색상
- 문(門): `#0a82ff` (파랑)
- 지명: `#2c952c` (초록)
- 건물: `#ff607f` (분홍)
- 미상: `#c714e3` (보라)
- 기타: `#ffa500` (주황)

## 주요 라이브러리 (CDN)
- jQuery 3.5.1
- DataTables 1.11.3
- PapaParse 5.3.0
- Bootstrap 4.4.1
- Font Awesome 5.15.4

## 데이터 형식

`asset/csv/data.csv` 컬럼:
- 명칭: 건물/장소 한글 이름
- 한자: 한자 표기
- 위치: `top, left` 픽셀 좌표 (쉼표로 구분)
- 분류: 문/지명/건물/미상
- 이미지: 해당 배치도 이름 (h1 태그와 매칭용)
- 기여자: 데이터 기여자 정보
