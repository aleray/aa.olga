describe("The AA utils", function() {

    it("can be found", function() {
        expect(AA.utils).toBeDefined();
    });
    
    describe("The utility toHash", function(){
        it("always produces the same result", function(){
            expect(AA.utils.toHash("Sherry Turkle")).toBe(1312915434);
        });
    });
    
    describe("The utility path2mime", function(){
        it("knows to find a mime-type for a filename", function(){
            expect(AA.utils.path2mime("poster.jpg")).toBe("image/jpeg");
        });
    });
    
    describe("The utility uri2mime", function(){
        it("is like path2mime, yet it works for a url", function(){
            expect(AA.utils.uri2mime("http://example.com/poster.jpg")).toBe("image/jpeg");
        });
        it("even when using fragment identifiers", function(){
            expect(AA.utils.uri2mime("http://example.com/poster.jpg#xywh=160,120,320,240")).toBe("image/jpeg");
        });
        it("if there is no extension, it as served as `application/octet-stream`", function(){
            expect(AA.utils.uri2mime("http://example.com/poster")).toBe("application/octet-stream");
        });
        it("this is also the case if the extension is not recognised", function(){
            expect(AA.utils.uri2mime("http://example.com/poster.some-proprietary-extension")).toBe("application/octet-stream");
        });
    });
  
  
});
