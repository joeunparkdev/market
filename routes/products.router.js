const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const Product = require("../schemas/products.schema");

// 상품 작성 API
router.post("/products", async (req, res) => {
  const { password, title, content, author } = req.body;
  if (!password || !title || !content || !author) {
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }

  // 패스워드를 해시로 변환
  bcrypt.hash(password, 10, async (hashError, hashPassword) => {
    if (hashError) {
      return res
        .status(500)
        .json({ errorMessage: "비밀번호 해싱 중 오류가 발생했습니다." });
    }

    // MongoDB를 사용하여 상품 생성
    try {
      const newProduct = await Product.create({
        title,
        content,
        password: hashPassword,
        author,
      });
      res.json({
        message: "상품을 생성하였습니다.",
        productId: newProduct._id,
      });
    } catch (error) {
      res
        .status(500)
        .json({ errorMessage: "상품을 생성하는 중 오류가 발생했습니다." });
    }
  });
});

// 상품 목록 조회 API
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    const responseData = products.map((product) => {
      return {
        productId: product._id,
        title: product.title,
        content: product.content,
        status: product.status,
        author: product.author,
        createdAt: product.createdAt,
      };
    });
    res.status(200).json({ data: responseData });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "상품을 조회하는 중 오류가 발생했습니다." });
  }
});

// 상품 상세 조회 API
router.get("/products/:_productId", async (req, res) => {
  try {
    const productId = req.params._productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ errorMessage: "상품을 찾을 수 없습니다." });
    }

    const responseData = {
      productId: product._id,
      title: product.title,
      content: product.content,
      status: product.status,
      author: product.author,
      createdAt: product.createdAt,
    };

    res.status(200).json({ data: responseData });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "상품을 상세 조회하는 중 오류가 발생했습니다." });
  }
});

// 상품 정보 수정 API
router.put("/products/:_productId", async (req, res) => {
  const productId = req.params._productId;
  const { password, title, content, status } = req.body;

  // 다른 데이터 형식 확인
  if (!password || !title || !content || !status) {
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }

  // 유효한 상태인지 확인
  if (!["FOR_SALE", "SOLD_OUT"].includes(status)) {
    return res
      .status(400)
      .json({ errorMessage: "유효하지 않은 상품 상태입니다." });
  }

  //상품 존재 여부 및 비밀번호 확인
  const existingproduct = await Product.findById(productId);
  if (!existingproduct) {
    return res.status(404).json({ errorMessage: "상품을 찾을 수 없습니다." });
  }

  // 비밀번호 해시 비교
  bcrypt.compare(
    password,
    existingproduct.password,
    async (compareError, isMatch) => {
      if (compareError || !isMatch) {
        return res
          .status(403)
          .json({ errorMessage: "비밀번호가 일치하지 않습니다." });
      }

      //상품 수정
      existingproduct.title = title;
      existingproduct.status = status;
      existingproduct.content = content;

      try {
        await existingproduct.save();
        res.status(200).json({ message: "상품을 수정하였습니다." });
      } catch (error) {
        res
          .status(500)
          .json({ errorMessage: "상품을 수정하는 중 오류가 발생했습니다." });
      }
    },
  );
});

//상품 삭제 API
router.delete("/products/:_productId", async (req, res) => {
  const productId = req.params._productId;
  const password = req.body.password;

  // 상품 존재 여부 및 비밀번호 확인
  const existingproduct = await Product.findById(productId);

  if (!existingproduct) {
    return res.status(404).json({ errorMessage: "상품을 찾을 수 없습니다." });
  }

  // 비밀번호 해시 비교
  bcrypt.compare(
    password,
    existingproduct.password,
    async (compareError, isMatch) => {
      if (compareError || !isMatch) {
        return res
          .status(403)
          .json({ errorMessage: "비밀번호가 일치하지 않습니다." });
      }

      try {
        // 상품 삭제
        const deleteResult = await Product.deleteOne({ _id: productId });

        if (deleteResult.deletedCount === 1) {
          res.status(200).json({ message: "상품을 삭제하였습니다." });
        } else {
          res
            .status(500)
            .json({ errorMessage: "상품을 삭제하는 중 오류가 발생했습니다." });
        }
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({ errorMessage: "상품을 삭제하는 중 오류가 발생했습니다." });
      }
    },
  );
});

//전체 상품 삭제 API
router.delete("/products", async (req, res) => {
  try {
    const products = await Product.find({});

    if (products.length === 0) {
      res.status(404).json({ message: "상품이 존재하지 않습니다." });
      return;
    }

    await Product.deleteMany({});
    res.status(200).json({ message: "전체 상품을 삭제하였습니다." });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "상품을 삭제하는 중 오류가 발생했습니다." });
  }
});

module.exports = router;
