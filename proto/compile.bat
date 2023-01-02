@echo off 
SETLOCAL

REM Compile for client
set PROTO_DIR=..\client\src\proto
set TYPE=Javascript
call :COMPILE

REM Compile for server
set PROTO_DIR=..\server\proto
set TYPE=Python
call :COMPILE

REM End of program
goto :EXIT

REM Functions to compile
:COMPILE
echo Compiling for %TYPE%, output dir %PROTO_DIR% 
if not exist %PROTO_DIR% mkdir %PROTO_DIR%
del /Q %PROTO_DIR%\*.*
if %TYPE% == Python bin\protoc --proto_path=src --python_out=%PROTO_DIR% src/*.proto
if %TYPE% == Javascript bin\protoc --proto_path=src --js_out=import_style=commonjs,binary:%PROTO_DIR% src/*.proto
EXIT /B %ERRORLEVEL%

REM Pause for debug
:EXIT
pause
