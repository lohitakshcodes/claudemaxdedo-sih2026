
import Cocoa
import Quartz

let pdfUrl = URL(fileURLWithPath: CommandLine.arguments[1])
let outDir = CommandLine.arguments[2]
let prefix = CommandLine.arguments[3]

if let doc = PDFDocument(url: pdfUrl) {
    for i in 0..<doc.pageCount {
        if let page = doc.page(at: i) {
            let bounds = page.bounds(for: .mediaBox)
            let scale: CGFloat = 2.0
            let size = NSSize(width: bounds.width * scale, height: bounds.height * scale)
            let image = NSImage(size: size)
            image.lockFocus()
            let ctx = NSGraphicsContext.current!.cgContext
            ctx.scaleBy(x: scale, y: scale)
            page.draw(with: .mediaBox, to: ctx)
            image.unlockFocus()
            
            if let tiffData = image.tiffRepresentation,
               let bitmap = NSBitmapImageRep(data: tiffData),
               let pngData = bitmap.representation(using: .png, properties: [:]) {
                let outUrl = URL(fileURLWithPath: "\(outDir)/\(prefix)_slide_\(i + 1).png")
                try? pngData.write(to: outUrl)
                print("Saved \(outUrl.path)")
            }
        }
    }
}
