"""Create a Linux-compatible deployment ZIP with explicit POSIX entry names."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
source = root / 'output' / 'azure-app'
destination = root / 'output' / 'myenglishjourney-deploy.zip'
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for file in sorted(source.rglob('*')):
        if file.is_file():
            if file.name.startswith('.env') or file.name == '.hosting.env':
                raise ValueError('Private settings must not be packaged')
            archive.write(file, file.relative_to(source).as_posix())
with ZipFile(destination) as archive:
    assert all('\\' not in name for name in archive.namelist())
    assert 'server/hosted-server.cjs' in archive.namelist()
    assert 'web/index.html' in archive.namelist()
    print(f'Created Linux-compatible ZIP: {len(archive.namelist())} files.')
