@echo off
pushd "%~1"
for /r %%x in (*.js) do (
    type "%%~x"
)
popd