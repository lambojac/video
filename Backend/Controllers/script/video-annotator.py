import cv2
import numpy as np
import re
import sys
import json
import urllib.request

ANNOTATION_WIDTH = 640
ANNOTATION_HEIGHT = 360


def parse_rgba(rgba_str, default_color=(64,64,64), default_alpha=0.9):
    match = re.match(r'rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)', rgba_str)
    if match:
        r, g, b, a = map(float, match.groups())
        return (int(r), int(g), int(b)), a
    return default_color, default_alpha

def scale_coords(x, y, vid_width, vid_height):
    scale_x = vid_width / ANNOTATION_WIDTH
    scale_y = vid_height / ANNOTATION_HEIGHT
    return int(x * scale_x), int(y * scale_y)

def draw_rounded_box(frame, x, y, w, h, radius, color, alpha):
    overlay = frame.copy()
    cv2.rectangle(overlay, (x+radius, y), (x+w-radius, y+h), color, -1, lineType=cv2.LINE_AA)
    cv2.rectangle(overlay, (x, y+radius), (x+w, y+h-radius), color, -1, lineType=cv2.LINE_AA)
    
    for dx, dy in [(radius, radius), (w-radius, radius), (radius, h-radius), (w-radius, h-radius)]:
        cv2.circle(overlay, (x+dx, y+dy), radius, color, -1)
    
    cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)

def draw_annotation(frame, anno, fps, frame_no, vid_width, vid_height):
    startF = int(anno["startTime"] * fps)
    endF = int(anno["endTime"] * fps)

    if not (startF <= frame_no <= endF):
        return

    arrow_start = scale_coords(anno["arrowStart"]["x"], anno["arrowStart"]["y"], vid_width, vid_height)
    arrow_end = scale_coords(anno["x"], anno["y"], vid_width, vid_height)

    bgColor, bgAlpha = parse_rgba(anno.get("style", {}).get("backgroundColor", "rgba(64,64,64,0.9)"))
    textColor = (255, 255, 255)
    arrowColor = (255, 255, 255)

    padding = anno.get("style", {}).get("padding", 10)
    borderRadius = anno.get("style", {}).get("borderRadius", 15)
    fSize = anno.get("fontSize", 14)

    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = fSize / 30.0
    thickness = 1
    text_size, _ = cv2.getTextSize(anno["text"], font, scale, thickness)

    bubble_w = text_size[0] + padding * 2
    bubble_h = text_size[1] + padding * 2
    bubble_x = arrow_start[0] - bubble_w // 2
    bubble_y = arrow_start[1] - bubble_h // 2

    draw_rounded_box(frame, bubble_x, bubble_y, bubble_w, bubble_h, borderRadius, bgColor, bgAlpha)

    cv2.putText(frame, anno["text"], (bubble_x + padding, bubble_y + bubble_h - padding), font, scale, textColor, thickness, cv2.LINE_AA)

    cv2.arrowedLine(frame, arrow_start, arrow_end, arrowColor, 2, line_type=cv2.LINE_AA, tipLength=0.02)  # Reduced arrowhead size

def main():
    input_video_path = sys.argv[1]
    output_video_path = sys.argv[2]
    annotations = json.loads(sys.argv[3])  

    cap = cv2.VideoCapture(input_video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    vid_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    vid_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_video_path, fourcc, fps, (vid_width, vid_height))
    frame_no = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        for anno in annotations:
            draw_annotation(frame, anno, fps, frame_no, vid_width, vid_height)

        out.write(frame)
        frame_no += 1

    cap.release()
    out.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()