import { maskAddress, maskName, maskPhone } from "@/shared/lib/mask";

// #test/필수 #test/개인정보 #test/단위
describe("개인정보 마스킹", () => {
  test("이름은 1자는 전부, 2자는 끝 글자, 3자 이상은 가운데를 가린다", () => {
    expect(maskName("홍")).toBe("*");
    expect(maskName("김철")).toBe("김*");
    expect(maskName("홍길동")).toBe("홍*동");
    expect(maskName("남궁민수")).toBe("남**수");
  });

  test("연락처는 하이픈 유무와 상관없이 가운데를 가린다", () => {
    expect(maskPhone("010-1234-5678")).toBe("010-****-5678");
    expect(maskPhone("01012345678")).toBe("010-****-5678");
  });

  test("너무 짧은 연락처는 전부 가린다", () => {
    expect(maskPhone("1234")).toBe("****");
  });

  test("주소는 앞 두 단어만 남긴다", () => {
    expect(maskAddress("서울시 성동구 베이커리로 12")).toBe("서울시 성동구 ********");
    expect(maskAddress("  서울시   성동구  베이커리로 12 ")).toBe("서울시 성동구 ********");
  });
});
