// =====================================================
// 🔮 BACCARAT AI VIP PRO MAX
// 👑 ADMIN: @vanminh2603
// 📌 API: /bcr/:table
// ✅ Dự đoán Nhà Cái / Con
// ✅ AI bắt cầu
// ✅ Cầu đảo
// ✅ Cầu bệt
// ✅ Long Bảo
// ✅ Độ tin cậy
// ✅ Lưu lịch sử
// ✅ Full tiếng Việt
// ✅ Auto cập nhật
// ✅ Hỗ trợ bàn 1-10 + C01-C16
// =====================================================

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ================= CONFIG =================

const SOURCE_API = "http://103.159.50.60:5000";

// ================= LỊCH SỬ =================

let history = {};

function saveHistory() {

    fs.writeFileSync(
        "history.json",
        JSON.stringify(history, null, 2)
    );
}

function loadHistory() {

    if (fs.existsSync("history.json")) {

        history = JSON.parse(
            fs.readFileSync("history.json")
        );
    }
}

loadHistory();

// ================= AI PHÂN TÍCH =================

function analyzeRoad(result) {

    if (!result || result.length < 2) {

        return {

            prediction: "CHỜ",

            confidence: 50,

            confidence_text: "YẾU",

            reason: "Không đủ dữ liệu",

            road: "Không xác định",

            longbao: false,

            banker_percent: 0,

            player_percent: 0
        };
    }

    let arr = result.split("");

    let banker = 0;
    let player = 0;
    let tie = 0;

    arr.forEach(i => {

        if (i === "B") banker++;

        if (i === "P") player++;

        if (i === "T") tie++;
    });

    // ================= CẦU BỆT =================

    let last = arr[arr.length - 1];

    let streak = 1;

    for (let i = arr.length - 2; i >= 0; i--) {

        if (arr[i] === last) {

            streak++;

        } else {

            break;
        }
    }

    // ================= CẦU ĐẢO =================

    let alternating = true;

    for (let i = arr.length - 6; i < arr.length - 1; i++) {

        if (i >= 0) {

            if (arr[i] === arr[i + 1]) {

                alternating = false;
            }
        }
    }

    // ================= LONG BẢO =================

    let longbao = false;

    if (streak >= 4) {

        longbao = true;
    }

    // ================= AI PHÂN TÍCH =================

    let prediction = "BANKER";

    let confidence = 50;

    let reason = "";

    let road = "";

    // ===== CẦU BỆT =====

    if (streak >= 3) {

        prediction = last === "B"
            ? "BANKER"
            : "PLAYER";

        confidence = 88;

        reason = `AI phát hiện cầu bệt ${streak}`;

        road = last === "B"
            ? "Bệt Nhà Cái"
            : "Bệt Con";
    }

    // ===== CẦU ĐẢO =====

    else if (alternating) {

        prediction = last === "B"
            ? "PLAYER"
            : "BANKER";

        confidence = 81;

        reason = "AI phát hiện cầu đảo";

        road = "Bắt cầu đảo";
    }

    // ===== PHÂN TÍCH TỶ LỆ =====

    else {

        if (banker >= player) {

            prediction = "BANKER";

            confidence =
                70 + Math.floor(
                    banker / (banker + player) * 20
                );

            reason =
                "AI phân tích nghiêng Nhà Cái";

            road =
                "Cầu nghiêng Nhà Cái";

        } else {

            prediction = "PLAYER";

            confidence =
                70 + Math.floor(
                    player / (banker + player) * 20
                );

            reason =
                "AI phân tích nghiêng Con";

            road =
                "Cầu nghiêng Con";
        }
    }

    // ================= ĐỘ TIN CẬY =================

    let level = "YẾU";

    if (confidence >= 85) {

        level = "RẤT CAO";

    } else if (confidence >= 75) {

        level = "CAO";

    } else if (confidence >= 65) {

        level = "TRUNG BÌNH";
    }

    return {

        prediction,

        confidence,

        confidence_text: level,

        reason,

        road,

        longbao,

        banker_percent: banker,

        player_percent: player,

        tie_count: tie
    };
}

// ================= API GỐC =================

async function getTables() {

    const res = await axios.get(
        `${SOURCE_API}/all`
    );

    return res.data.data || [];
}

// ================= MAP BÀN =================

const TABLE_MAP = {

    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10",

    "c01": "1001",
    "c02": "1002",
    "c03": "1003",
    "c04": "1004",
    "c05": "1005",
    "c06": "1006",
    "c07": "1007",
    "c08": "1008",
    "c09": "1009",
    "c10": "1010",
    "c11": "1011",
    "c12": "1012",
    "c13": "1013",
    "c14": "1014",
    "c15": "1015",
    "c16": "1016"
};

// ================= API /bcr/:table =================

app.get("/bcr/:table", async (req, res) => {

    try {

        let table = req.params.table.toLowerCase();

        let tableId = TABLE_MAP[table];

        if (!tableId) {

            return res.json({

                admin: "@vanminh2603",

                status: false,

                message: "Không tìm thấy bàn"
            });
        }

        let tables = await getTables();

        let current = tables.find(
            x => x.table_id == tableId
        );

        if (!current) {

            return res.json({

                admin: "@vanminh2603",

                status: false,

                message: "Không có dữ liệu"
            });
        }

        let result = current.result || "";

        let ai = analyzeRoad(result);

        // ================= LƯU LỊCH SỬ =================

        if (!history[table]) {

            history[table] = [];
        }

        history[table].push({

            time: new Date().toLocaleString("vi-VN"),

            prediction: ai.prediction,

            confidence: ai.confidence,

            result
        });

        if (history[table].length > 50) {

            history[table].shift();
        }

        saveHistory();

        // ================= JSON RESPONSE =================

        res.json({

            admin: "@vanminh2603",

            status: true,

            table_id: current.table_id,

            table: current.table_name,

            game: current.game_code,

            road: ai.road,

            good_road:
                current.goodRoad || "Không có",

            ket_qua_day_du: result,

            ket_qua_gan_nhat:
                result.slice(-20),

            tong_van:
                result.length,

            nha_cai:
                ai.banker_percent,

            con:
                ai.player_percent,

            hoa:
                ai.tie_count,

            du_doan:
                ai.prediction === "BANKER"
                    ? "NHÀ CÁI"
                    : "CON",

            do_tin_cay:
                ai.confidence + "%",

            muc_do:
                ai.confidence_text,

            ly_do:
                ai.reason,

            long_bao:
                ai.longbao
                    ? "ĐANG CÓ LONG BẢO"
                    : "Không",

            lich_su:
                history[table]
                    .slice(-10)
                    .reverse(),

            time:
                new Date()
                    .toLocaleTimeString("vi-VN")
        });

    } catch (err) {

        res.json({

            admin: "@vanminh2603",

            status: false,

            error: err.message
        });
    }
});

// ================= API DANH SÁCH BÀN =================

app.get("/tables", async (req, res) => {

    try {

        let data = await getTables();

        res.json({

            admin: "@vanminh2603",

            status: true,

            total: data.length,

            data
        });

    } catch (err) {

        res.json({

            status: false,

            error: err.message
        });
    }
});

// ================= AUTO LOOP =================

setInterval(async () => {

    try {

        await getTables();

        console.log(
            "✅ AI cập nhật:",
            new Date()
                .toLocaleTimeString("vi-VN")
        );

    } catch (e) {

        console.log("❌ Lỗi API");
    }

}, 5000);

// ================= HOME =================

app.get("/", (req, res) => {

    res.send(`

    <center>

    <h1>🔮 BACCARAT AI VIP PRO MAX</h1>

    <h3>👑 ADMIN: @vanminh2603</h3>

    <p>✅ API ĐANG HOẠT ĐỘNG</p>

    <hr>

    <h3>📌 API BÀN THƯỜNG</h3>

    <p>/bcr/1</p>
    <p>/bcr/2</p>
    <p>/bcr/3</p>
    <p>/bcr/4</p>
    <p>/bcr/5</p>
    <p>/bcr/6</p>
    <p>/bcr/7</p>
    <p>/bcr/8</p>
    <p>/bcr/9</p>
    <p>/bcr/10</p>

    <hr>

    <h3>📌 API BÀN C</h3>

    <p>/bcr/c01</p>
    <p>/bcr/c02</p>
    <p>/bcr/c03</p>
    <p>/bcr/c04</p>
    <p>/bcr/c05</p>
    <p>/bcr/c06</p>
    <p>/bcr/c07</p>
    <p>/bcr/c08</p>
    <p>/bcr/c09</p>
    <p>/bcr/c10</p>
    <p>/bcr/c11</p>
    <p>/bcr/c12</p>
    <p>/bcr/c13</p>
    <p>/bcr/c14</p>
    <p>/bcr/c15</p>
    <p>/bcr/c16</p>

    </center>

    `);
});

// ================= START SERVER =================

app.listen(PORT, () => {

    console.log(`

==================================================
🔮 BACCARAT AI VIP PRO MAX
👑 ADMIN: @vanminh2603
🚀 PORT: ${PORT}
==================================================

`);
});
