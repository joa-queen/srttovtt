var fs = require('fs');
var iconv = require('iconv-lite');
var charsetDetect = require('jschardet');
var captions = require('node-captions');

module.exports = {

  transform: function(srtPath) {
    vttPath = srtPath.replace('.srt', '.vtt');
    srtData = fs.readFileSync(srtPath);

    decode(srtData, function (srtDecodedData) {
        captions.srt.parse(srtDecodedData, function (err, vttData) {
            if (err) {
                return cb(err, null);
            }
            // Overwrite srt with UTF-8 encoding
            fs.writeFile(srtPath, srtDecodedData, 'utf8');
            // Save vtt as UTF-8 encoded, so that foreign subs will be shown correctly on ext. devices.
            fs.writeFile(vttPath, captions.vtt.generate(captions.srt.toJSON(vttData)), 'utf8', function (err) {
                if (err) {
                    return cb(err, null);
                } else {
                    return {
                        vtt: vttPath,
                        srt: srtPath,
                        encoding: 'utf8'
                    };
                }
            });
        });
    });
  },

  decode: function(dataBuff,  callback) {
      var targetEncodingCharset = 'utf8';

      var charset = charsetDetect.detect(dataBuff);
      var detectedEncoding = charset.encoding;

      dataBuff = iconv.encode(iconv.decode(dataBuff, detectedEncoding), targetEncodingCharset);
      callback(dataBuff.toString('utf8'));
  }
};
