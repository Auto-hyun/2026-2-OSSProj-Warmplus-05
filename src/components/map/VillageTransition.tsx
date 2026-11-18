'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { MAP_BOX_STYLE, PLACES, placeStyle, SKY } from './village';

/** 홈 방 그림(public/village/room-shelves.webp)과 문 그림들(room-door-*.webp) 원본 크기 */
const ROOM_W = 941;
const ROOM_H = 1672;
/** 홈 바탕색 (OmokRoom 섹션 배경과 같게) */
const ROOM_BG = '#d99c67';

const DURATION = 2700;

type Pt = { x: number; y: number };
/** 방 그림 위 문 가운데 (비율). 감정 친구들 뒤 벽에 있다 */
const DOOR: Pt = { x: 0.5, y: 0.43 };
/** 지도 그림 위 오목이 집 앞마당(문 너머로 처음 보이는 곳)과 오목이 집 가운데 (비율) */
const YARD: Pt = { x: 0.478, y: 0.235 };
const HOUSE: Pt = { x: 0.478, y: 0.136 };

/** 시간 비율(0~1) 기준 구간: 문 통과가 끝나는 때, 마을이 다 펼쳐져 멈추는 때 */
const T_DOOR = 0.37;
const T_END = 0.93;
/** 마을 카메라 배율: 문 너머로 처음 볼 때 → 문을 지날 때 (그 뒤 1배까지 한 번에 부드럽게) */
const S_START = 4.4;
const S_DOOR = 3.9;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * 마을 카메라 배율 (시간 비율 u). 로그 배율로 계산해 줌 속도가 고르게 느껴지게 한다.
 * 문 구간: 아주 천천히 다가오는 듯 줄어듦 → 문 뒤: 그 속도 그대로 이어서 출발해 가속했다가 끝에 속도 0으로 멈춤 (에르미트 곡선)
 */
function worldScale(u: number) {
  const l0 = Math.log(S_START);
  const l1 = Math.log(S_DOOR);
  const v = (l1 - l0) / T_DOOR;
  if (u <= T_DOOR) return Math.exp(l0 + v * u);
  const t = clamp01((u - T_DOOR) / (T_END - T_DOOR));
  const m0 = v * (T_END - T_DOOR);
  const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
  const h10 = t ** 3 - 2 * t ** 2 + t;
  return Math.exp(h00 * l1 + h10 * m0);
}

/**
 * 그림 상자(원점 왼쪽 위)를 s배로 키우면서 그림 위 점 p(비율)가 화면 점 q(px)에 오게 하는 transform.
 * box는 변형 전 상자 위치·크기 (화면 기준 px)
 */
function camera(box: DOMRect, p: Pt, q: Pt, s: number) {
  const tx = q.x - box.x - s * p.x * box.width;
  const ty = q.y - box.y - s * p.y * box.height;
  return `translate(${tx}px, ${ty}px) scale(${s})`;
}

/**
 * 홈 → 마음 마을 전환 (2.7초, 문 밖으로).
 *   0~0.5초   감정 친구들 뒤 벽에 문이 흐릿하게 나타나며 다가감 (문 아래 그림자, 바닥에 비치는 빛)
 *   0.5~1.0초 친구들 머리 위로 문을 빠르게 통과. 문 너머로 집 앞 돌길
 *   1.0~1.4초 돌길에서 시선이 올라가 오목이 집 외관
 *   1.4~2.5초 그 집이 그대로 작아지며 마을 전체가 펼쳐짐 (끝으로 갈수록 천천히)
 *   2.5~2.7초 정착 → onDone (지도 화면이 같은 구도로 열리며 제목과 건물 통통)
 * 문 너머 풍경·집 외관·마을이 모두 같은 마을 그림을 확대·이동한 것이라 장면이 바뀌는 순간이 없다.
 * 그림 상자 위치·크기는 홈(OmokRoom)과 지도(MapScreen)와 똑같이 둬서 시작과 끝이 실제 화면과 겹친다.
 * 누르면 바로 끝난다
 */
export function VillageTransition({ onDone }: { onDone: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const plainRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLImageElement>(null);
  const spillRef = useRef<HTMLSpanElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  const finishedRef = useRef(false);

  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    const stage = stageRef.current;
    const room = roomRef.current;
    const world = worldRef.current;
    if (!stage || !room || !world) return;
    let cancelled = false;
    const animations: Animation[] = [];

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      doneRef.current();
    };

    const start = () => {
      if (cancelled) return;
      const s = stage.getBoundingClientRect();
      const box = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return new DOMRect(r.x - s.x, r.y - s.y, r.width, r.height);
      };
      const roomBox = box(room);
      const worldBox = box(world);
      const center = { x: s.width / 2, y: s.height / 2 };
      const doorNow = { x: roomBox.x + DOOR.x * roomBox.width, y: roomBox.y + DOOR.y * roomBox.height };
      const doorNear = { x: doorNow.x + (center.x - doorNow.x) * 0.4, y: doorNow.y + (center.y - doorNow.y) * 0.4 };
      // 지도 화면에서 오목이 집이 놓이는 자리 (카메라가 결국 여기로 돌아온다)
      const houseHome = { x: worldBox.x + HOUSE.x * worldBox.width, y: worldBox.y + HOUSE.y * worldBox.height };
      const opts: KeyframeAnimationOptions = { duration: DURATION, fill: 'forwards' };
      const run = (el: Element | null, frames: Keyframe[]) => el && animations.push(el.animate(frames, opts));

      // 방 카메라: 문 가운데를 화면 가운데로 끌어오며 확대. 20배면 문 구멍이 화면을 다 덮고 친구들은 화면 아래로 빠진다.
      // 문을 지나는 마지막 순간(0.84~1.08초)엔 멈추지 않고 계속 다가가며 옅어져, 그 너머 집 앞 풍경과 겹쳐 이어진다
      run(room, [
        { offset: 0, transform: camera(roomBox, DOOR, doorNow, 1), opacity: 1, easing: 'cubic-bezier(.4,0,.6,1)' },
        { offset: 0.185, transform: camera(roomBox, DOOR, doorNear, 1.6), easing: 'cubic-bezier(.6,0,.95,.55)' },
        { offset: 0.31, opacity: 1 },
        { offset: 0.37, transform: camera(roomBox, DOOR, center, 20) },
        { offset: 0.4, transform: camera(roomBox, DOOR, center, 26), opacity: 0 },
        { offset: 1, transform: camera(roomBox, DOOR, center, 26), opacity: 0 },
      ]);
      // 원래 방 그림이 문 구멍을 메우고 있다가 빠지며 문 너머 풍경이 비친다. 문틀은 흐릿하고 옅게 시작해 또렷해진다
      run(plainRef.current, [{ offset: 0, opacity: 1 }, { offset: 0.03, opacity: 1 }, { offset: 0.17, opacity: 0 }, { offset: 1, opacity: 0 }]);
      run(frameRef.current, [
        { offset: 0, opacity: 0, filter: 'blur(5px)' },
        { offset: 0.02, opacity: 0, filter: 'blur(5px)' },
        { offset: 0.17, opacity: 1, filter: 'blur(0px)' },
        { offset: 1, opacity: 1, filter: 'blur(0px)' },
      ]);
      run(spillRef.current, [{ offset: 0, opacity: 0 }, { offset: 0.06, opacity: 0 }, { offset: 0.2, opacity: 0.9 }, { offset: 1, opacity: 0.9 }]);
      // 마을 카메라: 하나의 카메라가 집 앞마당 → 오목이 집 → 마을 전체로 끊김 없이 물러난다.
      // 50ms마다 위치를 계산해 찍어서 구간이 바뀌어도 속도·위치가 튀지 않는다.
      //  - 배율: worldScale (문 너머 느린 움직임을 그대로 이어받아 천천히 출발 → 가속 → 끝에 천천히 멈춤)
      //  - 바라보는 곳: 앞마당에서 오목이 집으로 부드럽게 올라감 (0.68~1.67초)
      //  - 그 지점이 놓이는 화면 자리: 화면 가운데에서, 물러난 만큼 지도 속 오목이 집 자리로 → 끝에선 지도 화면과 정확히 같다
      const steps = Math.round(DURATION / 50);
      const worldFrames: Keyframe[] = [];
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const sc = worldScale(u);
        const look = smoothstep(clamp01((u - 0.25) / 0.37));
        const p = { x: lerp(YARD.x, HOUSE.x, look), y: lerp(YARD.y, HOUSE.y, look) };
        const away = u <= T_DOOR ? 0 : clamp01((S_DOOR - sc) / (S_DOOR - 1));
        const q = { x: lerp(center.x, houseHome.x, away), y: lerp(center.y, houseHome.y, away) };
        worldFrames.push({ offset: u, transform: u >= T_END ? 'translate(0px, 0px) scale(1)' : camera(worldBox, p, q, sc) });
      }
      run(world, worldFrames);
      // 빛 번짐은 문을 지나는 순간에만 아주 옅게 (화면이 하얗게 덮이지 않게)
      run(lightRef.current, [{ offset: 0, opacity: 0 }, { offset: 0.3, opacity: 0 }, { offset: 0.36, opacity: 0.18 }, { offset: 0.46, opacity: 0 }, { offset: 1, opacity: 0 }]);
      // 홈에만 있던 말풍선·유리병이 갑자기 사라지지 않게 전환 화면을 잠깐 겹쳐 띄운다
      stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, fill: 'forwards' });

      animations[0]?.finished.then(finish, () => {});
    };

    // 그림이 다 준비된 뒤 시작 (늦어도 0.8초 안에)
    const images = Array.from(stage.querySelectorAll('img'));
    const ready = Promise.all(images.map((img) => img.decode().catch(() => {})));
    Promise.race([ready, new Promise((r) => setTimeout(r, 800))]).then(start);

    return () => {
      cancelled = true;
      animations.forEach((a) => a.cancel());
    };
  }, []);

  /** 전환 중 누르면 바로 마을로 */
  const skip = () => {
    stageRef.current?.getAnimations({ subtree: true }).forEach((a) => a.finish());
  };

  return (
    <div
      ref={stageRef}
      aria-hidden
      onClick={skip}
      className="fixed inset-y-0 left-1/2 z-[35] h-dvh w-full max-w-[480px] -translate-x-1/2 overflow-hidden opacity-0"
      style={{ background: SKY }}
    >
      {/* 마을: 지도 화면과 같은 상자. 배경 + 건물 */}
      <div className="absolute bottom-0 left-1/2 isolate -translate-x-1/2" style={MAP_BOX_STYLE}>
        <div ref={worldRef} className="absolute inset-0 origin-top-left">
          <Image src="/village/village-map.webp" alt="" fill loading="eager" sizes="480px" className="-z-10 object-cover" />
          <span aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[8%]" style={{ background: `linear-gradient(${SKY}, transparent)` }} />
          {PLACES.map((p) => (
            <Image
              key={p.src}
              src={`/village/${p.src}.webp`}
              alt=""
              width={p.size[0]}
              height={p.size[1]}
              loading="eager"
              sizes="200px"
              className="absolute h-auto select-none [filter:drop-shadow(0_8px_10px_rgba(80,55,20,0.22))]"
              style={placeStyle(p)}
            />
          ))}
        </div>
      </div>

      {/* 방: 홈과 같은 상자. 원래 방 그림 → 문 구멍 낸 방 그림 → 문틀 → 바닥 빛 → 감정 친구들 */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{ aspectRatio: `${ROOM_W} / ${ROOM_H}`, width: `max(100%, calc((100dvh - 76px) * ${ROOM_W / ROOM_H}))` }}
      >
        <div ref={roomRef} className="absolute inset-0 origin-top-left">
          {/* 방 그림 아래 남는 자리 (홈 바탕색) */}
          <div className="absolute top-full -left-1/2 h-dvh w-[200%]" style={{ background: ROOM_BG }} />
          <Image ref={plainRef} src="/village/room-shelves.webp" alt="" fill loading="eager" sizes="480px" className="object-cover" />
          <Image src="/village/room-door-hole.webp" alt="" fill loading="eager" sizes="480px" className="object-cover" />
          <Image ref={frameRef} src="/village/room-door-frame.webp" alt="" fill loading="eager" sizes="480px" className="object-cover opacity-0" />
          <span
            ref={spillRef}
            className="absolute top-[55%] left-[20%] h-[16%] w-[60%] rounded-[50%] opacity-0 mix-blend-screen"
            style={{ background: 'radial-gradient(closest-side, rgba(255,226,170,0.75), rgba(255,226,170,0))' }}
          />
          <Image
            src="/village/friends.webp"
            alt=""
            width={900}
            height={625}
            loading="eager"
            sizes="(max-width: 480px) 65vw, 312px"
            className="absolute left-[17.5%] w-[65%] select-none"
            style={{ top: `${(772 / ROOM_H) * 100}%` }}
          />
        </div>
      </div>

      <div
        ref={lightRef}
        className="absolute inset-0 opacity-0"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,238,200,0.85), rgba(255,228,176,0.25) 60%, transparent 85%)' }}
      />
    </div>
  );
}
