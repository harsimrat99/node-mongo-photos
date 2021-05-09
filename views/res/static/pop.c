#include <windows.h>
#include <gdiplus.h>
#include <tchar.h>
#include <iostream>
#include <chrono>

#define CURRENT_WND_CLASS _T("GameWndClass_Didiet")
#define DEF_CX 800
#define DEF_CY 600
#define DEF_CYY 640

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
void setup(ULONG_PTR&, Gdiplus::GdiplusStartupInput&, HDC&);

HWND hwnd; /* Window Handle */
HDC myHdc;
// Global variable
CRITICAL_SECTION CriticalSection;
long col = 255;

static inline int64_t GetTicks();

INT WINAPI _tWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPTSTR lpCmdLine, int nCmdShow)
{
	WNDCLASSEX wcex; /* Structure needed for creating Window */
	MSG msg;
	BOOL bDone = FALSE;
	SIZE screenSize;
	LONG winX, winY;
	PAINTSTRUCT ps;
	ULONG_PTR gdiToken;
	Gdiplus::GdiplusStartupInput gdiInput;

	ZeroMemory(&wcex, sizeof(WNDCLASSEX));
	ZeroMemory(&msg, sizeof(MSG));

	wcex.cbSize = sizeof(WNDCLASSEX);
	wcex.hbrBackground = (HBRUSH)GetStockObject(WHITE_BRUSH);
	wcex.hCursor = LoadCursor(hInstance, IDC_ARROW);
	wcex.hIcon = LoadIcon(hInstance, IDI_APPLICATION);
	wcex.hInstance = hInstance;
	wcex.lpfnWndProc = WndProc;
	wcex.lpszClassName = CURRENT_WND_CLASS;
	wcex.style = CS_HREDRAW | CS_VREDRAW;
	wcex.cbWndExtra = 0;
	wcex.cbClsExtra = 0;
	wcex.lpszMenuName = NULL;

	if (!RegisterClassEx(&wcex))
	{
		return -1;
	}

	screenSize.cx = GetSystemMetrics(SM_CXSCREEN);
	screenSize.cy = GetSystemMetrics(SM_CYSCREEN);

	winX = (screenSize.cx - (DEF_CX + GetSystemMetrics(SM_CXBORDER) * 2)) / 2;
	winY = (screenSize.cy - (DEF_CY + GetSystemMetrics(SM_CYBORDER) + GetSystemMetrics(SM_CYCAPTION))) / 2;

	hwnd = CreateWindowEx(
		WS_EX_OVERLAPPEDWINDOW,
		CURRENT_WND_CLASS,
		_T("Game Window"),
		WS_OVERLAPPEDWINDOW,
		winX, winY,
		DEF_CX, DEF_CYY,
		0,
		0,
		hInstance,
		0);

	ShowWindow(hwnd, SW_SHOW);
	UpdateWindow(hwnd);

	//initialise GDI objects
	setup(gdiToken, gdiInput, myHdc);

	ULONGLONG  lastTime = GetTicks();
	double amountOfTicks = 60;
	double ns = 1000000000 / amountOfTicks;
	long delta = 0;	

	int ret = SetTimer(hwnd, 1, 100, NULL);
	if (ret == 0)
		MessageBox(hwnd, "Could not SetTimer()!", "Error", MB_OK | MB_ICONEXCLAMATION);

	while (FALSE == bDone && col > 10)
	{
		if (PeekMessage(&msg, hwnd, 0, 0, PM_REMOVE))
		{
			TranslateMessage(&msg);
			DispatchMessage(&msg);

			if (msg.message == WM_QUIT)
			{
				bDone = TRUE;
			}
		}

		else if (col >= 15)
		{			
					
			auto p = GetTicks();

			HDC hdcBuffer = CreateCompatibleDC(myHdc);
			HBITMAP hbmBuffer = CreateCompatibleBitmap(myHdc, DEF_CX, DEF_CY);
			SelectObject(hdcBuffer, hbmBuffer);
			Gdiplus::Graphics gf(hdcBuffer);
			int increment = 0;			
			
			EnterCriticalSection(&CriticalSection);

			for (int i = DEF_CX; i > DEF_CX / 2; i -= col, increment++) {
							
				Gdiplus::SolidBrush brush(Gdiplus::Color(255, i%255, i%255, i%255));
				int x = (DEF_CX - i), y = (DEF_CX - i), w = DEF_CX - increment * 2 * col, h= DEF_CY - increment* 2 * col;
				gf.FillRectangle(&brush, x,y,w,h);				
			
				if (col == 15) {
				
					WCHAR string[] =
						USER;

					Gdiplus::FontFamily   fontFamily(L"Arial");
					Gdiplus::Font         font(&fontFamily, 12, Gdiplus::FontStyleBold, Gdiplus::UnitPoint);
					Gdiplus::RectF        rectF(x,y,w,h);
					Gdiplus::StringFormat stringFormat;					
					brush.SetColor(Gdiplus::Color(255, 255, 255, 255));

					// Center-justify each line of text.
					stringFormat.SetAlignment(Gdiplus::StringAlignmentCenter);
					// Center the block of text (top to bottom) in the rectangle.
					stringFormat.SetLineAlignment(Gdiplus::StringAlignmentCenter);
					gf.DrawString(string, -1, &font, rectF, &stringFormat, &brush);

				}
			}

			LeaveCriticalSection(&CriticalSection);

			BitBlt(myHdc, 0, 0, DEF_CX, DEF_CY, hdcBuffer, 0, 0, SRCCOPY);
			DeleteDC(hdcBuffer);

			auto pp = GetTicks();
			auto l = (pp - p)/1e6;
			auto delta = 17 - l;

			if (delta > 0 && delta < 17)
				Sleep(delta);

		}

	}

	DestroyWindow(hwnd);
	UnregisterClass(CURRENT_WND_CLASS, hInstance);	
	DeleteCriticalSection(&CriticalSection);
	return 0;
}

// Gets the current number of ticks from QueryPerformanceCounter. Throws an
// exception if the call to QueryPerformanceCounter fails.
static inline int64_t GetTicks()
{
	return std::chrono::duration_cast<std::chrono::nanoseconds>
		(std::chrono::high_resolution_clock::now().time_since_epoch()).count();

}

LRESULT CALLBACK WndProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	switch (uMsg)
	{
	case WM_TIMER:	
		EnterCriticalSection(&CriticalSection);
		col -= 10;
		LeaveCriticalSection(&CriticalSection);			
		break;	
	case WM_QUIT:
	case WM_DESTROY:
	case WM_CLOSE:
		PostQuitMessage(0);
		break;
	default:
		return DefWindowProc(hWnd, uMsg, wParam, lParam);
	}
	return 0;
}

void setup(ULONG_PTR& gdiToken, Gdiplus::GdiplusStartupInput& gdiInput, HDC& myHdc)
{
	myHdc = GetDC(hwnd);
	bool answer = Gdiplus::GdiplusStartup(&gdiToken, &gdiInput, NULL);
	// Initialize the critical section one time only.
	if (!InitializeCriticalSectionAndSpinCount(&CriticalSection,
		0x00000400))
		return;
}