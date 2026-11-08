# Code-drawn illustrated state outline. No map tiles, network, or image dependencies.
Add-Type -AssemblyName System.Drawing
$mapPoints = @(@(60,25),@(190,25),@(190,145),@(305,327),@(293,350),@(304,363),@(294,387),@(302,406),@(240,416),@(209,400),@(202,377),@(170,368),@(153,346),@(130,341),@(110,315),@(101,288),@(84,275),@(81,252),@(66,239),@(71,223),@(57,207),@(47,182),@(32,161),@(38,141),@(28,124),@(32,105),@(23,96),@(38,77),@(45,58),@(57,44))
$mapSvgPoints = ($mapPoints | ForEach-Object { '{0},{1}' -f $_[0],$_[1] }) -join ' '
$mapSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 450"><rect width="340" height="450" rx="24" fill="#E4F5FF"/><polygon points="' + $mapSvgPoints + '" fill="#A9D8B0" stroke="#C89C37" stroke-width="4" stroke-linejoin="round"/><path d="M79 116 L100 240 L159 270 L184 210 L251 345 L202 360" fill="none" stroke="#FFF7CE" stroke-width="4" stroke-dasharray="7 7"/></svg>'
$assetFolder = Join-Path $PSScriptRoot '../assets/game-art'
[System.IO.File]::WriteAllText((Join-Path $assetFolder 'california-mastery.svg'),$mapSvg)
$mapBitmap = New-Object System.Drawing.Bitmap(1020,1350)
$mapGraphics = [System.Drawing.Graphics]::FromImage($mapBitmap)
$mapGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$mapGraphics.ScaleTransform(3,3)
$mapGraphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#E4F5FF'))
$mapPolygon = [System.Drawing.PointF[]]@($mapPoints | ForEach-Object { New-Object System.Drawing.PointF($_[0],$_[1]) })
$mapFill = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#A9D8B0'))
$mapPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#C89C37'),4)
$mapPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$mapGraphics.FillPolygon($mapFill,$mapPolygon)
$mapGraphics.DrawPolygon($mapPen,$mapPolygon)
$routePen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#FFF7CE'),4)
$routePen.DashPattern = [single[]]@(2,2)
$routePoints = [System.Drawing.PointF[]]@((New-Object System.Drawing.PointF(79,116)),(New-Object System.Drawing.PointF(100,240)),(New-Object System.Drawing.PointF(159,270)),(New-Object System.Drawing.PointF(184,210)),(New-Object System.Drawing.PointF(251,345)),(New-Object System.Drawing.PointF(202,360)))
$mapGraphics.DrawLines($routePen,$routePoints)
$mapBitmap.Save((Join-Path $assetFolder 'california-mastery.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$routePen.Dispose(); $mapPen.Dispose(); $mapFill.Dispose(); $mapGraphics.Dispose(); $mapBitmap.Dispose()
