# Генерация иконок ПОБЕДА: тёмный фон, красная буква П
Add-Type -AssemblyName System.Drawing

function MakeIcon([int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

  $bg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 11))
  $g.FillRectangle($bg, 0, 0, $size, $size)

  # красная полоса сверху — фирменный акцент
  $accent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 77, 46))
  $bandH = [int]($size * 0.06)
  $g.FillRectangle($accent, 0, 0, $size, $bandH)

  $fontSize = [float]($size * 0.52)
  $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF([float]0, [float]($size * 0.04), [float]$size, [float]$size)
  $g.DrawString('П', $font, $accent, $rect, $fmt)

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "OK: $path"
}

MakeIcon 192 (Join-Path $PSScriptRoot 'icon-192.png')
MakeIcon 512 (Join-Path $PSScriptRoot 'icon-512.png')
